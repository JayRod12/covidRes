from django.contrib import admin

from .models import Patient, MachineType, Machine

admin.site.register(Patient)
admin.site.register(MachineType)
admin.site.register(Machine)
