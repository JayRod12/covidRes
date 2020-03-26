from rest_framework import serializers
from .models import Patient, Machine, MachineAssignment

class PatientSerializer(serializers.ModelSerializer):
	class Meta:
		model = Patient
		fields = ('name', 'severity', 'admission_date')

class MachineAssignmentSerializer(serializers.ModelSerializer):
	class Meta:
		model = MachineAssignment
		fields = ['patient', 'machine', 'start_date', 'end_date']

class MachineSerializer(serializers.ModelSerializer):
	machine_assignments = MachineAssignmentSerializer(many=True, read_only=True)

	class Meta:
		model = Machine
		fields = ('model', 'location', 'machine_assignments')
