from django.contrib import admin
from .models import *   # example model

admin.site.register(Student)
# Register your models 
admin.site.register(Attendance)
