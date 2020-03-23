from django.db import models

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
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE)
    machine = models.ForeignKey(Machine, on_delete=models.CASCADE)
    start_date = models.DateTimeField('start date')
    end_date = models.DateTimeField('end date')

    