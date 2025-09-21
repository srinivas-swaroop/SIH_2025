from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone
import numpy as np
import pickle
from datetime import datetime, timedelta

class Student(models.Model):
    teacher = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="students",
        null=True, blank=True
    )
    gender = models.CharField(max_length=10, blank=True)
    name = models.CharField(max_length=100)
    roll_no = models.CharField(max_length=50, unique=True)
    embedding_blob = models.BinaryField(null=True, blank=True)
    email=models.EmailField()

    def save_embedding(self, embedding: np.ndarray):
        self.embedding_blob = pickle.dumps(embedding.astype(np.float32))
        if self.pk:
            self.save(update_fields=['embedding_blob'])
        else:
            self.save()

    def load_embedding(self) -> np.ndarray:
        if not self.embedding_blob:
            return None
        return np.array(pickle.loads(self.embedding_blob), dtype=np.float32)

    def __str__(self):
        return f"{self.name} ({self.roll_no})"


from django.utils import timezone

def current_time():
    return timezone.now().time()

class Attendance(models.Model):
    student = models.ForeignKey(
        Student, on_delete=models.CASCADE, related_name="attendances"
    )
    date = models.DateField(default=timezone.now)
    present = models.BooleanField(default=False)
    time = models.TimeField(default=current_time)  # ✅ FIXED

    class Meta:
        unique_together = ('student', 'date')
        ordering = ['-date']

    def __str__(self):
        status = "Present" if self.present else "Absent"
        teacher_name = self.student.teacher.username if self.student.teacher else "No Teacher"
        return f"{self.student.name} - {self.date} - {status} - {teacher_name} - {self.time} - {self.student.gender}"
