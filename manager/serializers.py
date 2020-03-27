from rest_framework import serializers
from .models import Patient, MachineType, Machine, AssignmetTask
from .models import User, Message

# Manage
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

class AssignmetTaskSerializer(serializers.ModelSerializer):
	class Meta:
		model = AssignmetTask
		fields = ('patient', 'machine', 'start_date', 'end_date', 'bool_install', 'bool_completed')

# User
class UserSerializer(serializers.ModelSerializer):
	class Meta:
		model = User
		fields = ('role', 'role')

class MessageSerializer(serializers.ModelSerializer):
	sender_username = serializers.CharField(source='sender.username', read_only=True)
	sender_role = serializers.CharField(source='sender.role', read_only=True)
	class Meta:
		model = Message
		fields = ('sender', 'receiver', 'date', 'message', 'sender_username', 'sender_role')
