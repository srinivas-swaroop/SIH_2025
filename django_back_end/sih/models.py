from django.db import models
import numpy as np
import pickle
from django.contrib.auth.models import User

class Student(models.Model):
    teacher = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="students",
        null=True, blank=True  
    )
    gender=models.CharField(max_length=10)
    name = models.CharField(max_length=100)
    roll_no = models.CharField(max_length=50, unique=True)
    embedding_blob = models.BinaryField(null=True, blank=True)

    def save_embedding(self, embedding: np.ndarray):
    
     self.embedding_blob = pickle.dumps(embedding.astype(np.float32))
    
     if self.pk:  
        # Object already exists → only update embedding field
        self.save(update_fields=['embedding_blob'])
     else:  
        # New object (no primary key yet) → do full save
        self.save()

    def load_embedding(self) -> np.ndarray:
        """
        Load the stored embedding as a NumPy array.
        Returns float32 array.
        """
        if not self.embedding_blob:
            return None
        return np.array(pickle.loads(self.embedding_blob), dtype=np.float32)

    def __str__(self):
        return f"{self.name} ({self.roll_no})"
    

from django.db import models
from django.utils import timezone

class Attendance(models.Model):
    student = models.ForeignKey(
        Student, on_delete=models.CASCADE, related_name="attendances"
    )
   
    date = models.DateField(default=timezone.now)
    present = models.BooleanField(default=False)
    time=models.TimeField(default=timezone.now)

    class Meta:
        unique_together = ('student', 'date')  
        ordering = ['-date']  

    def __str__(self):
        status = "Present" if self.present else "Absent"
        return f"{self.student.name} - {self.date} - {status}-{self.teacher.name}-{self.time}"
