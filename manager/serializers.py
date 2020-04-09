from rest_framework import serializers
from .models import Patient, MachineType, Location, Machine, AssignmentTask
from .models import User, Message, Role

# Manage
class PatientSerializer(serializers.ModelSerializer):
	# Machine-related
	machine_assigned_model = serializers.CharField(source='machine_assigned.model.name', allow_null=True, read_only=True)
	location_name = serializers.CharField(source='location.name', allow_null=True, read_only=True)
	class Meta:
		model = Patient
		fields = ('pk', 'name', 'severity', 'location', 'location_name', 'admission_date', 'machine_assigned', 'machine_assigned_model', 'description')
class PatientDetailedSerializer(serializers.ModelSerializer):
	# User-related
	user_pk = serializers.IntegerField(source='user.pk', allow_null=True, read_only=True)
	role = serializers.CharField(source='user.role.name', allow_null=True, read_only=True)
	username = serializers.CharField(source='user.username', allow_null=True)
	first_name = serializers.CharField(source='user.first_name', allow_null=True)
	last_name = serializers.CharField(source='user.last_name', allow_null=True)
	location_name = serializers.CharField(source='location.name', allow_null=True, read_only=True)
	# Machine-related
	machine_assigned_model = serializers.CharField(source='machine_assigned.model.name', allow_null=True, read_only=True)
	class Meta:
		model = Patient
		fields = ('pk', 'name', 'severity', 'location', 'location_name', 'admission_date', 'machine_assigned', 'machine_assigned_model', 'description', 'user_pk', 'role', 'username', 'first_name', 'last_name', 'history_severity_x', 'history_severity_y')

class MachineTypeSerializer(serializers.ModelSerializer):
	class Meta:
		model = MachineType
		fields = ('pk', 'name', 'description')

class LocationSerializer(serializers.ModelSerializer):
	class Meta:
		model = Location
		fields = ('pk', 'name', 'description')

class MachineSerializer(serializers.ModelSerializer):
	model_name = serializers.CharField(source='model.name', read_only=True)
	patient_assigned_name = serializers.CharField(source='patient_assigned.name', allow_null=True, read_only=True)
	location_name = serializers.CharField(source='location.name', allow_null=True, read_only=True)
	class Meta:
		model = Machine
		fields = ('pk', 'model', 'model_name', 'location', 'location_name', 'patient_assigned', 'patient_assigned_name', 'description')

class AssignmentTaskSerializer(serializers.ModelSerializer):
	patient_name = serializers.CharField(source='patient.name', read_only=True)
	machine_model = serializers.CharField(source='machine.model.name', read_only=True)
	patient_location = serializers.CharField(source='patient.location', read_only=True)
	machine_location = serializers.CharField(source='machine.location', read_only=True)
	class Meta:
		model = AssignmentTask
		fields = ('pk', 'patient', 'machine', 'patient_name', 'machine_model', 'patient_location', 'machine_location', 'start_date', 'end_date', 'date', 'bool_install', 'bool_completed')

# User
class UserSerializer(serializers.ModelSerializer):
	role_name = serializers.CharField(source='role.name', read_only=True)
	class Meta:
		model = User
		fields = ('pk', 'role', 'role_name', 'username', 'first_name', 'last_name')

class MessageSerializer(serializers.ModelSerializer):
	sender_lastname = serializers.CharField(source='sender.last_name', read_only=True)
	sender_role = serializers.CharField(source='sender.role', read_only=True)
	patient_lastname = serializers.CharField(source='patient.user.last_name', read_only=True)
	class Meta:
		model = Message
		extra_kwargs = {
			'sender': {'required': False}
		}
		fields = (
			'pk',
			'date',
			'message',
			'sender',
			'sender_lastname',
			'sender_role',
			'patient',
			'patient_lastname'
		)

class RoleSerializer(serializers.ModelSerializer):
	class Meta:
		model = Role
		fields = '__all__'
