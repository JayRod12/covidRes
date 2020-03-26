from django.db import models
from django.utils import timezone
from django.urls import reverse
from datetime import datetime

class Patient(models.Model):
    name = models.CharField(max_length=100)
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
    description = models.TextField(blank=True)
    machine_pk = models.IntegerField(default=0)
    # History
    history_severity_x = models.TextField(blank=True)
    history_severity_y = models.TextField(blank=True)
    history_machine_x = models.TextField(blank=True)
    history_machine_y = models.TextField(blank=True)
    def __str__(self):
    	return self.name + ' #' + str(self.pk)
    def get_absolute_url(self):
        return reverse('patient', kwargs={'pk': self.pk})
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
    patient_pk = models.IntegerField(default=0)
    def __str__(self):
    	return self.model.name + ' #' + str(self.pk)
    def get_absolute_url(self):
        return reverse('machine', kwargs={'pk': self.pk})
