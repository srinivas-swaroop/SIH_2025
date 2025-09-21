from django.contrib.auth.models import User
from rest_framework import serializers
from .models import *;
class TeacherSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['id', 'username', 'password', 'email']

from rest_framework import serializers
from .models import Student

class StudentSerializer(serializers.ModelSerializer):
    teacher_id = serializers.IntegerField(source="teacher.id", read_only=True)
    teacher_username = serializers.CharField(source="teacher.username", read_only=True)

    class Meta:
        model = Student
        fields = ["id", "name", "roll_no", "gender", "teacher_id", "teacher_username","email"]


from rest_framework import serializers
from .models import Attendance

class AttendanceSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source="student.name", read_only=True)
    teacher = serializers.SerializerMethodField()
    status = serializers.SerializerMethodField()
    gender = serializers.CharField(source="student.gender", read_only=True)

    class Meta:
        model = Attendance
        fields = "__all__"

    def get_teacher(self, obj):
        return obj.student.teacher.username if obj.student.teacher else "No Teacher"

    def get_status(self, obj):
        return "Present" if obj.present else "Absent"

