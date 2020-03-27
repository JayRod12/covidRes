from .models import Patient, MachineType, Machine, AssignmetTask
from .models import Role, User, Message

def get_assignment_tasks_patient(patient):
    return AssignmetTask.objects.filter(patient=patient).filter(bool_completed=False)

def get_assignment_tasks_machine(machine):
    return AssignmetTask.objects.filter(machine=machine).filter(bool_completed=False)

def get_messages(me: User, you: User):
    received = Message.objects.filter(receiver=me).filter(sender=you)
    sent = Message.objects.filter(sender=me).filter(receiver=you)
    return {'received': received, 'sent': sent}
