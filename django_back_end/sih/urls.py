from django.urls import path
from .views import *
urlpatterns = [
    path('api/register/', RegisterStudent.as_view(), name='register-student'),
    path('api/register-faculty/',TeacherRegister.as_view()),
     path('api/login-faculty/', TeacherLogin.as_view()), 
     path('api/student-all/',RetriveAll.as_view()),
     path('api/attendance-all/',Attendances.as_view()),
]
