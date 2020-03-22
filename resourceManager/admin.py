from django.contrib import admin

from .models import Patient, Machine

admin.site.register(Patient)
admin.site.register(Machine)