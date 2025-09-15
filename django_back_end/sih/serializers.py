from django.contrib.auth.models import User
from rest_framework import serializers
from .models import *;
class TeacherSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['id', 'username', 'password', 'email']

class StudentSerializer(serializers.ModelSerializer):
    class Meta:
        model=Student
        fields=['id','name','teacher']

from rest_framework import serializers
from .models import Attendance

class AttendanceSerializer(serializers.ModelSerializer):
    # Custom fields
    student_name = serializers.CharField(source="student.name", read_only=True)
    teacher = serializers.CharField(source="student.teacher.username", read_only=True)
    status = serializers.SerializerMethodField()

    class Meta:
        model = Attendance
        fields = ["student_name", "teacher", "date", "time", "status"]

    def get_status(self, obj):
        return "Present" if obj.present else "Absent"

