from .models import Patient, MachineType, Machine, AssignmentTask
from .models import Role, User, Message

def get_assignment_tasks_patient(patient):
    return AssignmentTask.objects.filter(patient=patient).filter(bool_completed=False)

def get_assignment_tasks_machine(machine):
    return AssignmentTask.objects.filter(machine=machine).filter(bool_completed=False)

def get_messages(me: User, you: User):
    received = Message.objects.filter(receiver=me).filter(sender=you)
    sent = Message.objects.filter(sender=me).filter(receiver=you)
    return {'received': received, 'sent': sent}
