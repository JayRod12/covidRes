from rest_framework import generics, permissions, viewsets
from rest_framework.response import Response
from django.http import HttpResponseForbidden

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
    queryset = Machine.objects.all().order_by('model')
    serializer_class = MachineSerializer
    permission_classes = [permissions.IsAuthenticated & PermissionMachineEdit]
class MachineQueryViewSet(viewsets.ModelViewSet):
    queryset = Machine.objects.all()
    serializer_class = MachineSerializer
    permission_classes = [permissions.IsAuthenticated & PermissionMachineEdit]
    def get_queryset(self):
        queryset = super().get_queryset()
        if 'query' in self.kwargs:
            query = self.kwargs['query'].split('&')
            query = [q.split('=') for q in query]
            query = {q[0]:q[1] for q in query}
        if 'date' in query:
            overlaping_tasks = AssignmentTask.objects.filter(start_date__lte=query['date'], end_date__gte=query['date'])
            machine_pks = overlaping_tasks.values_list('machine', flat=True)
            queryset = queryset.filter(pk__in=machine_pks)
            query.pop('date', None);
        return queryset.filter(**query)

class PermissionTaskEdit(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.role.permission_task_edit
class AssignmentTaskViewSet(viewsets.ModelViewSet):
    queryset = AssignmentTask.objects.all().order_by('date')
    serializer_class = AssignmentTaskSerializer
    permission_classes = [permissions.IsAuthenticated & PermissionTaskEdit]
    def partial_update(self, request, *args, **kwargs):
        print("vars(request)")
        print(request.data)
        print("vars(args)")
        print(args)
        print("vars(kwargs)")
        print(kwargs)
        if 'bool_completed' in request.data or 'bool_install' in request.data:
            task = AssignmentTask.objects.get(pk=kwargs['pk'])
            if not (request.data['bool_completed'] == task.bool_completed and request.data['bool_install'] == task.bool_install):
                print("If 1")
                if not request.data['bool_completed']:
                    print("If 1.1")
                    if not task.patient.machine_assigned is None:
                        return HttpResponseForbidden('403 Forbidden, machine already has a patient', content_type='text/html')
                    if not task.machine.patient_assigned is None:
                        return HttpResponseForbidden('403 Forbidden, patient already has a machine', content_type='text/html')
                    task.patient.machine_assigned = task.machine
                    task.machine.patient_assigned = task.patient
                else:
                    print("If 1.2")
                    task.patient.machine_assigned = None
                    task.machine.patient_assigned = None
                task.patient.save()
                task.machine.save()
                task.save()
        print("HERE")
        return super(AssignmentTaskViewSet, self).partial_update(request, *args, **kwargs)
class AssignmentTaskQueryViewSet(viewsets.ModelViewSet):
    queryset = AssignmentTask.objects.all().order_by('date')
    serializer_class = AssignmentTaskSerializer
    permission_classes = [permissions.IsAuthenticated & PermissionTaskEdit]
    def get_queryset(self):
        print(self.kwargs)
        if 'query' in self.kwargs:
            query = self.kwargs['query'].split('&')
            query = [q.split('=') for q in query]
            query = {q[0]:q[1] for q in query}
        return super().get_queryset().filter(**query)

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
    def get_queryset(self):
        return super().get_queryset().filter(sender__pk=self.request.user.pk)
    def perform_create(self, serializer):
        serializer.save(sender=self.request.user)

class MessagePatientViewSet(viewsets.ModelViewSet):
    queryset = Message.objects.all().order_by('-date')
    serializer_class = MessageSerializer
    permission_classes = [permissions.IsAuthenticated & PermissionMessageEdit]
    def get_queryset(self):
        return super().get_queryset().filter(patient__pk=self.kwargs['patient_pk'])
