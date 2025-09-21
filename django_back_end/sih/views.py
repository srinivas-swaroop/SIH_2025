from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from .models import Student, Attendance
from django.contrib.auth.models import User
from .serializers import StudentSerializer, AttendanceSerializer, TeacherSerializer
from django.contrib.auth import authenticate, logout
import base64
import cv2
import numpy as np
import face_recognition

# -------------------- STUDENT REGISTER --------------------
class RegisterStudent(APIView):
    # permission_classes = [permissions.IsAuthenticated]
    def post(self, request):
        name = request.data.get("name")
        roll_no = request.data.get("roll_no")
        frame_data = request.data.get("frame")
        teacher_id = request.data.get("teacher")
        gender=request.data.get("gender")
        email=request.data.get("email")

        if not all([name, roll_no, frame_data, teacher_id,gender,email]):
            return Response({"error": "Missing data"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            teacher_obj = User.objects.get(id=teacher_id)
        except User.DoesNotExist:
            return Response({"error": "Teacher not found"}, status=status.HTTP_400_BAD_REQUEST)

        header, encoded = frame_data.split(",", 1)
        nparr = np.frombuffer(base64.b64decode(encoded), np.uint8)
        frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

        rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        face_locations = face_recognition.face_locations(rgb_frame, model="hog")
        if len(face_locations) == 0:
            return Response({"error": "No face detected"}, status=status.HTTP_400_BAD_REQUEST)

        face_encoding = face_recognition.face_encodings(rgb_frame, face_locations)[0]

        student = Student(name=name, roll_no=roll_no, teacher=teacher_obj,gender=gender,email=email)
        student.save()
        student.save_embedding(face_encoding)

        return Response({"message": f"Student {name} registered successfully"}, status=status.HTTP_201_CREATED)

# -------------------- TEACHER REGISTER --------------------
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
                # "id": user.id,
                "username": user.username,
                "email": user.email,
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# -------------------- TEACHER LOGIN --------------------
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

# -------------------- TEACHER LOGOUT --------------------
class TeacherLogout(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        logout(request)
        return Response({"detail": "Successfully logged out"}, status=status.HTTP_200_OK)

# -------------------- RETRIEVE STUDENTS --------------------
class RetriveAll(APIView):
    # permission_classes = [permissions.IsAuthenticated]
    def get(self, request):
        students = Student.objects.all()
        serializer = StudentSerializer(students, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

# -------------------- ATTENDANCE --------------------
class Attendances(APIView):
    # permission_classes = [permissions.IsAuthenticated]
    def get(self, request):
        attendance = Attendance.objects.all()
        serializer = AttendanceSerializer(attendance, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    


class FacultyList(APIView):
    def get(self, request):
        # Fetch all users who are teachers (you can filter if you have a separate group)
        teachers = User.objects.all()  
        serializer = TeacherSerializer(teachers, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

from django.utils import timezone

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.utils import timezone
from .models import Student, Attendance


class AttendanceAPI(APIView):
    def post(self, request):
        roll_no = request.data.get("roll_no")   # ✅ now expecting roll_no
        teacher_id = request.data.get("teacher")
        date = request.data.get("date", timezone.now().date())
        present = request.data.get("present", True)

        if not roll_no:
            return Response({"error": "roll_no is required"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            student = Student.objects.get(roll_no=roll_no)
        except Student.DoesNotExist:
            return Response({"error": "Student not found"}, status=status.HTTP_404_NOT_FOUND)

        attendance, created = Attendance.objects.get_or_create(
            student=student,
            date=date,
            defaults={
                "present": present,
                "time": timezone.now().time(),
                # "teacher_id": teacher_id,
            },
        )

        if not created:
            attendance.present = present
            attendance.time = timezone.now().time()
            attendance.teacher_id = teacher_id
            attendance.save()

        return Response(
            {
                "message": "Attendance marked successfully",
                "roll_no": roll_no,
                "date": str(date),
                "present": present,
            },
            status=status.HTTP_200_OK,
        )

from django.core.mail import send_mail
from django.conf import settings
class AbsenteesView(APIView):
    def post(self, request):
        absentees = request.data  
        for student in absentees:
            email = student.get("email")
            if email:
                send_mail(
                    subject="Attendance Info",
                    message=f"Hi {student.get('name')}, is absent to the class.",
                    from_email=settings.DEFAULT_FROM_EMAIL,
                    recipient_list=[email],
                    fail_silently=False,
                )
        return Response({"message": "Emails sent successfully"}, status=status.HTTP_200_OK)
        