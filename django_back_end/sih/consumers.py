# sih/consumers.py
import json
import base64
import cv2
import numpy as np
import pickle
import face_recognition
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async

STRICT_THRESHOLD = 0.4
REQUIRED_CONSECUTIVE_MATCHES = 5

class AttendanceConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        await self.accept()
        await self.send(text_data=json.dumps({"message": "WebSocket connected ✅"}))

        # Load all students safely in async context
        self.known_students = await self.load_students()
        self.match_counters = {}  # Track consecutive matches

    async def disconnect(self, close_code):
        print("WebSocket disconnected")

    async def receive(self, text_data):
        data = json.loads(text_data)
        frame_data = data.get("frame")
        if not frame_data:
            return

        # Convert Base64 to OpenCV image
        header, encoded = frame_data.split(",", 1)
        nparr = np.frombuffer(base64.b64decode(encoded), np.uint8)
        frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

        rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        face_locations = face_recognition.face_locations(rgb_frame, model="hog")
        face_encodings = face_recognition.face_encodings(rgb_frame, face_locations)

        recognized_students = []

        for face_encoding in face_encodings:
            # Compare face with all known students
            distances = [
                face_recognition.face_distance([s["embedding"]], face_encoding)[0]
                for s in self.known_students
            ]
            if distances:
                min_index = np.argmin(distances)
                min_dist = distances[min_index]
                student = self.known_students[min_index]
                roll_no = student["roll_no"]

                if min_dist < STRICT_THRESHOLD:
                    self.match_counters[roll_no] = self.match_counters.get(roll_no, 0) + 1
                    if self.match_counters[roll_no] >= REQUIRED_CONSECUTIVE_MATCHES:
                        recognized_students.append({
                            "name": student["name"],
                            "roll_no": student["roll_no"]
                        })
                        # Prevent duplicate recognition
                        self.match_counters[roll_no] = -9999
                else:
                    self.match_counters[roll_no] = 0

        await self.send(text_data=json.dumps({
            "recognized_students": recognized_students
        }))

    # Async-safe ORM call to load students
    @database_sync_to_async
    def load_students(self):
        from .models import Student
        students = []
        for student in Student.objects.all():
            students.append({
                "name": student.name,
                "roll_no": student.roll_no,
                "embedding": student.load_embedding()  # Synchronous but wrapped
            })
        return students
