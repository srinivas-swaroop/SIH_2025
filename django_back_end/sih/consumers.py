# sih/consumers.py
import json
import base64
import cv2
import numpy as np
import face_recognition
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async

# -------------------------
# Configurations
STRICT_THRESHOLD = 0.6  # Distance threshold for face match
FRAME_SCALE = 0.25      # Resize frame to 25% for faster processing
# -------------------------

class AttendanceConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        await self.accept()
        await self.send(text_data=json.dumps({"message": "WebSocket connected ✅"}))

        # Load all students asynchronously
        self.known_students = await self.load_students()
        print(f"[INFO] Loaded {len(self.known_students)} students")
        
    async def disconnect(self, close_code):
        print("[INFO] WebSocket disconnected")

    async def receive(self, text_data):
        data = json.loads(text_data)
        frame_data = data.get("frame")
        if not frame_data:
            return

        # -------------------------
        # Convert Base64 to OpenCV image
        header, encoded = frame_data.split(",", 1)
        nparr = np.frombuffer(base64.b64decode(encoded), np.uint8)
        frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        
        # Resize frame for speed
        small_frame = cv2.resize(rgb_frame, (0, 0), fx=FRAME_SCALE, fy=FRAME_SCALE)
        face_locations = face_recognition.face_locations(small_frame, model="hog")  # "cnn" for more accurate
        face_encodings = face_recognition.face_encodings(small_frame, face_locations)
        recognized_students = []

        for face_encoding in face_encodings:
            distances = [np.linalg.norm(face_encoding - s["embedding"]) for s in self.known_students]
            if distances:
                min_index = np.argmin(distances)
                min_dist = distances[min_index]
                student = self.known_students[min_index]

                if min_dist < STRICT_THRESHOLD:
                    recognized_students.append({
                        "name": student["name"],
                        "roll_no": student["roll_no"]
                    })

        # Send recognized students back to frontend
        await self.send(text_data=json.dumps({
            "recognized_students": recognized_students
        }))

    # -------------------------
    # Load students from database
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
