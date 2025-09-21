from django.urls import path
from .views import *
urlpatterns = [
    path('api/register/', RegisterStudent.as_view(), name='register-student'),
    path('api/register-faculty/',TeacherRegister.as_view()),
     path('api/login-faculty/', TeacherLogin.as_view()), 
     path('api/attendance-mark/',AttendanceAPI.as_view()),
     path('api/student-all/',RetriveAll.as_view()),
     path('api/attendance-all/',Attendances.as_view()),
     path('api/logout-faculty/',TeacherLogout.as_view()),
     path('api/faculty-all/',FacultyList.as_view()),
     path('api/absentees/',AbsenteesView.as_view())

]