from rest_framework import serializers
from .models import Patient, MachineType, Machine, AssignmetTask
from .models import User, Message

# Manage
class PatientSerializer(serializers.ModelSerializer):
	class Meta:
		model = Patient
		fields = ('pk', 'name', 'severity', 'admission_date', 'machine_assigned', 'description')
class PatientDetailedSerializer(serializers.ModelSerializer):
	user_pk = serializers.IntegerField(source='user.pk', allow_null=True)
	role = serializers.CharField(source='user.role.name', allow_null=True)
	username = serializers.CharField(source='user.username', allow_null=True)
	first_name = serializers.CharField(source='user.first_name', allow_null=True)
	last_name = serializers.CharField(source='user.last_name', allow_null=True)
	class Meta:
		model = Patient
		fields = ('pk', 'name', 'severity', 'admission_date', 'machine_assigned', 'description', 'user_pk', 'role', 'username', 'first_name', 'last_name')

class MachineTypeSerializer(serializers.ModelSerializer):
	class Meta:
		model = MachineType
		fields = ('pk', 'name', 'description')

class MachineSerializer(serializers.ModelSerializer):
	model_name = serializers.CharField(source='model.name', read_only=True)
	class Meta:
		model = Machine
		fields = ('pk', 'model', 'model_name', 'location', 'patient_assigned', 'description')

class AssignmetTaskSerializer(serializers.ModelSerializer):
	patient_name = serializers.CharField(source='patient.name', read_only=True)
	class Meta:
		model = AssignmetTask
		fields = ('pk', 'patient', 'machine', 'patient_name', 'start_date', 'end_date', 'date', 'bool_install', 'bool_completed')

# User
class UserSerializer(serializers.ModelSerializer):
	class Meta:
		model = User
		fields = ('pk', 'role', 'username', 'first_name', 'last_name')

class MessageSerializer(serializers.ModelSerializer):
	sender_username = serializers.CharField(source='sender.username', read_only=True)
	sender_role = serializers.CharField(source='sender.role', read_only=True)
	class Meta:
		model = Message
		fields = ('pk', 'sender', 'receiver', 'date', 'message', 'sender_username', 'sender_role')
