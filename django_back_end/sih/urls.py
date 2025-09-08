from django.urls import path
from .views import RegisterStudent

urlpatterns = [
    path('api/register/', RegisterStudent.as_view(), name='register-student'),
]
