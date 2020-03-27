from .models import Patient, MachineType, Machine, AssignmetTask
from .models import Role, User, Message

def get_assignment_tasks(Patient patient):
    return AssignmetTask.objects.filter(patient=patient).filter(bool_completed=False)

def get_assignment_tasks(Machine machine):
    return AssignmetTask.objects.filter(machine=machine).filter(bool_completed=False)

def get_messages(User me, User you):
    received = Message.objects.filter(receiver=me).filter(sender=you)
    sent = Message.objects.filter(sender=me).filter(receiver=you)
    return {'received': received, 'sent': sent}
