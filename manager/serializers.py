from rest_framework import serializers
from .models import Patient, MachineType, Machine

class PatientSerializer(serializers.ModelSerializer):
	class Meta:
		model = Patient
		fields = ('name', 'severity', 'admission_date', 'machine_pk', 'description')

class MachineTypeSerializer(serializers.ModelSerializer):
	class Meta:
		model = MachineType
		fields = ('name', 'description')

class MachineSerializer(serializers.ModelSerializer):
	class Meta:
		model = Machine
		fields = ('model', 'location', 'patient_pk', 'description')
