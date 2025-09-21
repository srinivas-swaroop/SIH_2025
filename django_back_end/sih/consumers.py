# sih/consumers.py
import json
import base64
import cv2
import numpy as np
import face_recognition
import dlib
from scipy.spatial import distance as dist
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async

# ------------------------- CONFIG ------------------------- #
STRICT_THRESHOLD = 0.6             # Higher tolerance → matches across different images
FRAME_SCALE = 0.25                 # Resize frame for faster processing
BLINK_EAR_THRESHOLD = 0.25         # Eye Aspect Ratio threshold for blink
BLINK_FRAMES_REQUIRED = 1          # Require just 1 blink frame
# ---------------------------------------------------------- #

# Dlib setup for blink detection
detector = dlib.get_frontal_face_detector()
predictor = dlib.shape_predictor("shape_predictor_68_face_landmarks.dat")

LEFT_EYE = list(range(36, 42))
RIGHT_EYE = list(range(42, 48))

# ------------------------- UTILS ------------------------- #
def eye_aspect_ratio(eye):
    A = dist.euclidean(eye[1], eye[5])
    B = dist.euclidean(eye[2], eye[4])
    C = dist.euclidean(eye[0], eye[3])
    return (A + B) / (2.0 * C)

def is_blinking(shape):
    left_eye = [(shape.part(i).x, shape.part(i).y) for i in LEFT_EYE]
    right_eye = [(shape.part(i).x, shape.part(i).y) for i in RIGHT_EYE]
    left_ear = eye_aspect_ratio(left_eye)
    right_ear = eye_aspect_ratio(right_eye)
    ear = (left_ear + right_ear) / 2.0
    return ear < BLINK_EAR_THRESHOLD

# ------------------------- CONSUMER ------------------------- #
class AttendanceConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        await self.accept()
        await self.send(text_data=json.dumps({"message": "WebSocket connected ✅"}))

        # Load students from DB
        self.known_students = await self.load_students()
        self.known_encodings = np.array([s["embedding"] for s in self.known_students])
        print(f"[INFO] Loaded {len(self.known_students)} students")

        # Track liveness per student
        self.liveness_confirmed = {}  # roll_no -> bool

    async def disconnect(self, close_code):
        print("[INFO] WebSocket disconnected")

    async def receive(self, text_data):
        data = json.loads(text_data)
        frame_data = data.get("frame")
        if not frame_data:
            return

        # ------------------------- Decode Base64 frame ------------------------- #
        header, encoded = frame_data.split(",", 1)
        nparr = np.frombuffer(base64.b64decode(encoded), np.uint8)
        frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

        rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        small_frame = cv2.resize(rgb_frame, (0, 0), fx=FRAME_SCALE, fy=FRAME_SCALE)

        # Face recognition
        face_locations = face_recognition.face_locations(small_frame, model="hog")
        face_encodings = face_recognition.face_encodings(small_frame, face_locations)
        recognized_students = []

        gray_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        scale_factor = 1.0 / FRAME_SCALE  # To map back coords to full frame

        for face_encoding, (top, right, bottom, left) in zip(face_encodings, face_locations):
            # Compare with all known encodings at once
            distances = face_recognition.face_distance(self.known_encodings, face_encoding)
            if not len(distances):
                continue

            min_index = np.argmin(distances)
            min_dist = distances[min_index]

            if min_dist < STRICT_THRESHOLD:
                student = self.known_students[min_index]
                roll_no = student["roll_no"]

                # Map back to full frame rect for blink detection
                rect = dlib.rectangle(
                    int(left * scale_factor), int(top * scale_factor),
                    int(right * scale_factor), int(bottom * scale_factor)
                )
                shape = predictor(gray_frame, rect)
                blinking = is_blinking(shape)

                if roll_no not in self.liveness_confirmed:
                    self.liveness_confirmed[roll_no] = False

                if blinking:
                    self.liveness_confirmed[roll_no] = True

                recognized_students.append({
                    "name": student["name"],
                    "roll_no": roll_no,
                    "liveness": self.liveness_confirmed[roll_no],
                    "distance": round(float(min_dist), 3)  # For debugging tolerance
                })

        await self.send(text_data=json.dumps({
            "recognized_students": recognized_students
        }))

    # ------------------------- Load students from DB ------------------------- #
    @database_sync_to_async
    def load_students(self):
        from .models import Student
        students = []
        for student in Student.objects.all():
            embedding = student.load_embedding()
            if embedding is not None and embedding.shape == (128,):
                students.append({
                    "name": student.name,
                    "roll_no": student.roll_no,
                    "embedding": embedding
                })
        return students