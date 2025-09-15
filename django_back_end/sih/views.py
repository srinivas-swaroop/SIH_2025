from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import *
from django.contrib.auth.models import User
from .serializers import *
from django.contrib.auth import authenticate
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

        header, encoded = frame_data.split(",", 1)
        nparr = np.frombuffer(base64.b64decode(encoded), np.uint8)
        frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

       
        rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        face_locations = face_recognition.face_locations(rgb_frame, model="hog")
        if len(face_locations) == 0:
            return Response({"error": "No face detected"}, status=status.HTTP_400_BAD_REQUEST)

        face_encoding = face_recognition.face_encodings(rgb_frame, face_locations)[0]
        student = Student(name=name, roll_no=roll_no)
        student.save()  
        student.save_embedding(face_encoding)

        return Response({"message": f"Student {name} registered successfully"})




 

class TeacherRegister(APIView):
    def post(self, request):
        serializer = TeacherSerializer(data=request.data)
        if serializer.is_valid():
            user = User.objects.create_user(
                username=serializer.validated_data['username'],
                email=serializer.validated_data.get('email', ''),
                password=serializer.validated_data['password'],
            )
            return Response({
                "id": user.id,
                "username": user.username,
                "email": user.email,
            }, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class TeacherLogin(APIView):
    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')

        if not username or not password:
            return Response({"detail": "Username and password required"}, status=status.HTTP_400_BAD_REQUEST)

        user = authenticate(username=username, password=password)
        if user is not None:
            serializer = TeacherSerializer(user)
            return Response(serializer.data, status=status.HTTP_200_OK)
        else:
            return Response({"detail": "Invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED)
        

class RetriveAll(APIView):
    def get(self,request):
        students=Student.objects.all()
        serializers=StudentSerializer(students,many=True)
        if serializers.is_valid:
            return Response(serializers.data,status=status.HTTP_200_OK)
        else:
            return Response("Fectched Error",status=status.HTTP_400_BAD_REQUEST)
class Attendances(APIView):
    def get(self,request):
        attendance=Attendance.objects.all()
        serializers=AttendanceSerializer(attendance,many=True)
        if serializers.is_valid:
            return Response(serializers.data,status=status.HTTP_200_OK)
        else :
            return Response("Failed",status=status.HTTP_308_PERMANENT_REDIRECT)
        