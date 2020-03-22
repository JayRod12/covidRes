from django.contrib import admin

from .models import Patient, Machine, MachineAssignment

admin.site.register(Patient)
admin.site.register(Machine)
admin.site.register(MachineAssignment)