from django.db import models
import numpy as np
import pickle

class Student(models.Model):
    name = models.CharField(max_length=100)
    roll_no = models.CharField(max_length=50)
    embedding_blob = models.BinaryField()

    def save_embedding(self, embedding: np.ndarray):
        # Convert to 128-dim float32 and pickle
        self.embedding_blob = pickle.dumps(embedding.astype(np.float32))

    def load_embedding(self):
        # Convert stored bytes back to NumPy array
        return np.array(pickle.loads(self.embedding_blob), dtype=np.float32)
