from django.contrib import admin

from .models import Patient, MachineType, Location, Machine, AssignmentTask
from .models import Role, User, Message

admin.site.register(Patient)
admin.site.register(MachineType)
admin.site.register(Machine)
admin.site.register(AssignmentTask)
admin.site.register(Location)

admin.site.register(Role)
admin.site.register(User)
admin.site.register(Message)
