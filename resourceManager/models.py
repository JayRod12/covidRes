from django.db import models

# Create your models here.


class Patient(models.Model):
	name = models.CharField(max_length=200)
	admission_date = models.DateTimeField('date when the patient was admitted into the hospital')
	def __str__(self):
		return self.name


class Machine(models.Model):
	name = models.CharField(max_length=200)
	patient = models.OneToOneField(Patient, blank=True, null=True, on_delete=models.SET_NULL)
	
	def is_free(self):
		return patient == None

	def __str__(self):
		return self.name
	