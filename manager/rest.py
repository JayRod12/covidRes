from rest_framework import generics, permissions, viewsets

from .models import Patient, MachineType, Machine, AssignmetTask
from .models import User, Message
from .serializers import PatientSerializer, MachineTypeSerializer, MachineSerializer, AssignmetTaskSerializer
from .serializers import UserSerializer, MessageSerializer
from .serializers import User, Message
from . import functions

class PermissionUserEdit(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.role.permission_user_edit
class PatientViewSet(viewsets.ModelViewSet):
    queryset = Patient.objects.all().order_by('-admission_date')
    serializer_class = PatientSerializer
    permission_classes = [permissions.IsAuthenticated & PermissionUserEdit]

class PermissionMachineTypeEdit(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.role.permission_machinetype_edit
class MachineTypeViewSet(viewsets.ModelViewSet):
    queryset = MachineType.objects.all()
    serializer_class = MachineTypeSerializer
    permission_classes = [permissions.IsAuthenticated & PermissionMachineTypeEdit]

class PermissionMachineEdit(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.role.permission_machine_edit
class MachineViewSet(viewsets.ModelViewSet):
    queryset = Machine.objects.all()
    serializer_class = MachineSerializer
    permission_classes = [permissions.IsAuthenticated & PermissionMachineEdit]

class PermissionTaskEdit(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.role.permission_task_edit
class AssignmetTaskViewSet(viewsets.ModelViewSet):
    queryset = AssignmetTask.objects.all()
    serializer_class = AssignmetTaskSerializer
    permission_classes = [permissions.IsAuthenticated & PermissionTaskEdit]

class PermissionUserEdit(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.role.permission_user_edit
class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated & PermissionTaskEdit]

class PermissionMessageEdit(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.role.permission_message_edit
class MessageViewSet(viewsets.ModelViewSet):
    queryset = Message.objects.all()
    serializer_class = MessageSerializer
    permission_classes = [permissions.IsAuthenticated & PermissionTaskEdit]
    def get_queryset(self):
        return Message.objects.filter(receiver=self.request.user)
class MessageConvViewSet(viewsets.ModelViewSet):
    queryset = Message.objects.all()
    serializer_class = MessageSerializer
    permission_classes = [permissions.IsAuthenticated & PermissionTaskEdit]
    def get_queryset(self):
        value = self.kwargs['you_pk']
        conversation = functions.get_messages(self.request.user, User.objects.get(pk=value))
        return conversation['received'] | conversation['sent']
