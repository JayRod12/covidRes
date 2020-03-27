from django.contrib import admin

from .models import Patient, MachineType, Machine, AssignmetTask
from .models import Role, User

admin.site.register(Patient)
admin.site.register(MachineType)
admin.site.register(Machine)
admin.site.register(AssignmetTask)

admin.site.register(Role)
admin.site.register(User)
