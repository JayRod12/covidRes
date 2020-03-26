from django.contrib import admin

from .models import Patient, Machine, MachineAssignment, User
from django.contrib.auth.admin import UserAdmin

admin.site.register(User, UserAdmin)
admin.site.register(Patient)
admin.site.register(Machine)
admin.site.register(MachineAssignment)
