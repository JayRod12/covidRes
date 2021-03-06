from django.db import models
from django.contrib.auth.models import AbstractUser
# Create your models here.

class Patient(models.Model):
    name = models.CharField(max_length=200)
    SEVERITY = (
        (1, 'Low'),
        (2, 'Moderate'),
        (3, 'Medium'),
        (4, 'High'),
        (5, 'Very High'),
    )
    severity = models.IntegerField(default=1, choices=SEVERITY)
    admission_date = models.DateTimeField('date when the patient was admitted into the hospital')
    def __str__(self):
        return self.name

class Machine(models.Model):
    model = models.CharField(max_length=200)
    location = models.CharField(max_length=200)

    def __str__(self):
        return self.model

class MachineAssignment(models.Model):
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE, related_name='machine_assignments')
    machine = models.ForeignKey(Machine, on_delete=models.CASCADE, related_name='machine_assignments')
    start_date = models.DateTimeField('start date')
    end_date = models.DateTimeField('end date')

class User(AbstractUser):
    is_doctor = models.BooleanField(default=False)
    is_nurse = models.BooleanField(default=False)
    is_family =  models.BooleanField(default=False)

class Nurse(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, primary_key=True)

class Doctor(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, primary_key=True)

class Family(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, primary_key=True)
