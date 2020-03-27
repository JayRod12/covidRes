from .models import Patient, MachineType, Machine, AssignmetTask
from .models import Role, User, Message

def get_assignment_tasks(obj):
    if obj is Patient:
        return AssignmetTask.objects.filter(patient=obj).filter(bool_completed=False)
    if obj is Machine:
        return AssignmetTask.objects.filter(machine=obj).filter(bool_completed=False)
    return AssignmetTask.objects.filter(patient=obj).filter(bool_completed=False)

def get_messages(me: User, you: User):
    received = Message.objects.filter(receiver=me).filter(sender=you)
    sent = Message.objects.filter(sender=me).filter(receiver=you)
    return {'received': received, 'sent': sent}
