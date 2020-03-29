from rest_framework import generics, permissions, viewsets
from rest_framework.response import Response

from django.shortcuts import get_object_or_404

from .models import Patient, MachineType, Machine, AssignmentTask
from .models import User, Message
from .serializers import (
    PatientSerializer,
    PatientDetailedSerializer,
    MachineTypeSerializer,
    MachineSerializer,
    AssignmentTaskSerializer
)
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
    def get_serializer_class(self):
        if 'pk' in self.kwargs:
            return PatientDetailedSerializer
        return self.serializer_class
    def get_queryset(self):
        return self.queryset

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
class AssignmentTaskViewSet(viewsets.ModelViewSet):
    queryset = AssignmentTask.objects.all()
    serializer_class = AssignmentTaskSerializer
    permission_classes = [permissions.IsAuthenticated & PermissionTaskEdit]
    def get_queryset(self):
        print(vars(self))
        return self.queryset

class PermissionUserEdit(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.role.permission_user_edit
class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated & PermissionTaskEdit]

class CurrentUserViewSet(viewsets.ViewSet):
    queryset = User.objects.all()
    permission_classes = [permissions.IsAuthenticated]

    def retrieve(self, request):
        user = get_object_or_404(queryset, pk=request.user.pk)
        print('HEEEEEy')
        serializer = UserSerializer(user)
        return Response(serializer.data)

class PermissionMessageEdit(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.role.permission_message_edit
class MessageViewSet(viewsets.ModelViewSet):
    queryset = Message.objects.all().order_by('-date')
    serializer_class = MessageSerializer
    permission_classes = [permissions.IsAuthenticated & PermissionMessageEdit]

    def perform_create(self, serializer):
        serializer.save(sender=self.request.user)

class MessageConvViewSet(viewsets.ModelViewSet):
    queryset = Message.objects.all().order_by('-date')
    serializer_class = MessageSerializer
    permission_classes = [permissions.IsAuthenticated & PermissionMessageEdit]
    def get_queryset(self):
        print(self.kwargs)
        value = self.kwargs['you_pk']
        conversation = functions.get_messages(self.request.user, User.objects.get(pk=value))
        return (conversation['received'] | conversation['sent']).order_by('date')
