from django.db import models
from django.utils import timezone
from django.urls import reverse
from datetime import datetime
from django.contrib.auth.models import AbstractUser

# Users
class Role(models.Model):
    name = models.CharField(max_length=100)
    # permission fields defined here
    permission_user_edit = models.BooleanField(default=False)
    permission_machinetype_edit = models.BooleanField(default=False)
    permission_machine_edit = models.BooleanField(default=False)
    permission_task_edit = models.BooleanField(default=False)
    permission_user_edit = models.BooleanField(default=False)
    permission_message_edit = models.BooleanField(default=False)
    def __str__(self):
    	return self.name

class User(AbstractUser):
    role = models.ForeignKey(Role, null=True, on_delete=models.CASCADE)
    def __str__(self):
    	return str(self.username)

# Manage
class Patient(models.Model):
    name = models.CharField(max_length=100)
    user = models.ForeignKey(User, null=True, on_delete=models.SET_NULL)
    SEVERITY = (
    	(0, 'Healed'),
        (1, 'Low'),
    	(2, 'Moderate'),
    	(3, 'Medium'),
    	(4, 'High'),
    	(5, 'Very High'),
    	(6, 'Dead'),
    )
    severity = models.IntegerField(default=1, choices=SEVERITY)
    admission_date = models.DateTimeField('Admission date: ', default=timezone.now)
    location = models.CharField(max_length=100, blank=True)
    description = models.TextField(blank=True)
    machine_assigned = models.ForeignKey('Machine', null=True, on_delete=models.SET_NULL)
    # History
    history_severity_x = models.TextField(blank=True)
    history_severity_y = models.TextField(blank=True)
    history_machine_x = models.TextField(blank=True)
    history_machine_y = models.TextField(blank=True)
    def __str__(self):
    	return self.name + ' #' + str(self.pk)
    def get_absolute_url(self):
        return reverse('patient', kwargs={'pk': self.pk})
    def assign_machine(self, machine):
        self.machine_assigned = machine
        if len(self.history_machine_y)==0:
            self.history_machine_x = str(timezone.now())[:-3] + str(timezone.now())[-2:]
            self.history_machine_y = str(machine.pk)
        elif not machine.pk == int(self.history_machine_y.split(', ')[-1]):
            self.history_machine_x += ', ' + str(timezone.now())[:-3] + str(timezone.now())[-2:]
            self.history_machine_y += ', ' + str(machine.pk)
    def get_history_severity(self):
        xx = [datetime.strptime(a, "%Y-%m-%d %H:%M:%S.%f%z") for a in self.history_severity_x.split(', ')]
        yy = [int(a) for a in self.history_severity_y.split(', ')]
        return [{'x': x, 'y': y} for x, y in zip(xx, yy)]
    def get_history_machine(self):
        if len(self.history_machine_y) == 0:
            return []
        xx = [datetime.strptime(a, "%Y-%m-%d %H:%M:%S.%f%z") for a in self.history_machine_x.split(', ')]
        yy = [int(a) for a in self.history_machine_y.split(', ')]
        return [{'x': x, 'y': y} for x, y in zip(xx, yy)]

class MachineType(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)

    def __str__(self):
    	return self.name

class Machine(models.Model):
    model = models.ForeignKey(MachineType, on_delete=models.CASCADE)
    location = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    patient_assigned = models.ForeignKey(Patient, null=True, on_delete=models.SET_NULL)
    def __str__(self):
    	return self.model.name + ' #' + str(self.pk)
    def get_absolute_url(self):
        return reverse('machine', kwargs={'pk': self.pk})

class AssignmetTask(models.Model):
    date = models.DateTimeField('Task by:', default=timezone.now)
    bool_completed = models.BooleanField(default=False)

    patient = models.ForeignKey(Patient, on_delete=models.CASCADE, related_name='machine_assignments')
    machine = models.ForeignKey(Machine, on_delete=models.CASCADE, related_name='machine_assignments')
    start_date = models.DateTimeField('initial date:', default=timezone.now)
    end_date = models.DateTimeField('end date:', default=timezone.now)
    bool_install = models.BooleanField('installed', default=False)
    def __str__(self):
    	return str(self.machine) + '->' + str(self.patient) + ' | ' + str(self.start_date) + ' --- ' + str(self.end_date)
    def get_absolute_url(self):
        return reverse('assignment_task', kwargs={'pk': self.pk})

# Messages
class Message(models.Model):
    sender = models.ForeignKey(User, related_name='%(class)s_sender', on_delete=models.CASCADE)
    receiver = models.ForeignKey(User, related_name='%(class)s_receiver', on_delete=models.CASCADE)
    date = models.DateTimeField(default=timezone.now)
    message = models.TextField()
    def __str__(self):
    	return str(self.sender) + '->' + str(self.receiver) + ' | ' + str(self.date)
