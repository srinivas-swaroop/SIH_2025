from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import Student
import face_recognition
import numpy as np
import base64
import cv2

class RegisterStudent(APIView):
    def post(self, request):
        name = request.data.get("name")
        roll_no = request.data.get("roll_no")
        frame_data = request.data.get("frame")

        if not all([name, roll_no, frame_data]):
            return Response({"error": "Missing data"}, status=status.HTTP_400_BAD_REQUEST)

        # Convert Base64 to image
        header, encoded = frame_data.split(",", 1)
        nparr = np.frombuffer(base64.b64decode(encoded), np.uint8)
        frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

        rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        face_locations = face_recognition.face_locations(rgb_frame, model="hog")
        if len(face_locations) == 0:
            return Response({"error": "No face detected"}, status=status.HTTP_400_BAD_REQUEST)

        face_encoding = face_recognition.face_encodings(rgb_frame, face_locations)[0]

        student = Student(name=name, roll_no=roll_no)
        student.save_embedding(face_encoding)
        student.save()

        return Response({"message": f"Student {name} registered successfully"})
