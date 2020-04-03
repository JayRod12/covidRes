from rest_framework import generics, permissions, viewsets, serializers
from rest_framework.response import Response
from django.http import HttpResponseForbidden

from django.shortcuts import get_object_or_404
import io
from rest_framework.parsers import JSONParser

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

class serializer_Date(serializers.Serializer):
    date = serializers.DateTimeField()

def parseDate(date_str):
    serializer = serializer_Date(data = {"date": date_str})
    serializer.is_valid()
    return serializer.validated_data['date']

class PermissionPatient(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.role.permission_patient_edit or (request.user.role.permission_patient_see and request.method in permissions.SAFE_METHODS)
class PatientViewSet(viewsets.ModelViewSet):
    queryset = Patient.objects.all().order_by('-admission_date')
    serializer_class = PatientSerializer
    permission_classes = [permissions.IsAuthenticated & PermissionPatient]
    def get_serializer_class(self):
        if 'pk' in self.kwargs:
            return PatientDetailedSerializer
        return self.serializer_class

class PermissionMachineType(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.role.permission_machinetype_edit or (request.user.role.permission_machinetype_see and request.method in permissions.SAFE_METHODS)
class MachineTypeViewSet(viewsets.ModelViewSet):
    queryset = MachineType.objects.all()
    serializer_class = MachineTypeSerializer
    permission_classes = [permissions.IsAuthenticated & PermissionMachineType]

class PermissionMachine(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.role.permission_machine_edit or (request.user.role.permission_machine_see and request.method in permissions.SAFE_METHODS)
class MachineViewSet(viewsets.ModelViewSet):
    queryset = Machine.objects.all().order_by('model')
    serializer_class = MachineSerializer
    permission_classes = [permissions.IsAuthenticated & PermissionMachine]
class MachineQueryViewSet(viewsets.ModelViewSet):
    queryset = Machine.objects.all()
    serializer_class = MachineSerializer
    permission_classes = [permissions.IsAuthenticated & PermissionMachine]
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

class PermissionTask(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.role.permission_task_edit or (request.user.role.permission_task_see and request.method in permissions.SAFE_METHODS)
class AssignmentTaskViewSet(viewsets.ModelViewSet):
    queryset = AssignmentTask.objects.all().order_by('date')
    serializer_class = AssignmentTaskSerializer
    permission_classes = [permissions.IsAuthenticated & PermissionTask]
    def create(self, request, *args, **kwargs):
        if 'start_date' in request.data or 'end_date' in request.data:
            date_serializer = serializers.DateTimeField()
            start_date = parseDate(request.data['start_date'])
            end_date = parseDate(request.data['end_date'])
            machine_pk = int(request.data['machine'])
            patient_pk = int(request.data['patient'])
            other_tasks_machine = AssignmentTask.objects.filter(machine__pk=machine_pk)
            other_tasks_patient = AssignmentTask.objects.filter(patient__pk=patient_pk)
            if other_tasks_machine.filter(start_date__gt=start_date, end_date__lt=start_date) or other_tasks_machine.filter(start_date__gt=end_date, end_date__lt=end_date):
                return HttpResponseForbidden('403 Forbidden, machine busy', content_type='text/html')
            if other_tasks_patient.filter(start_date__gt=start_date, end_date__lt=start_date) or other_tasks_patient.filter(start_date__gt=end_date, end_date__lt=end_date):
                return HttpResponseForbidden('403 Forbidden, patient busy', content_type='text/html')
            if other_tasks_machine.filter(start_date__lt=start_date, end_date__gt=start_date) or other_tasks_machine.filter(start_date__lt=end_date, end_date__gt=end_date):
                return HttpResponseForbidden('403 Forbidden, machine busy', content_type='text/html')
            if other_tasks_patient.filter(start_date__lt=start_date, end_date__gt=start_date) or other_tasks_patient.filter(start_date__lt=end_date, end_date__gt=end_date):
                return HttpResponseForbidden('403 Forbidden, patient busy', content_type='text/html')
        return super(AssignmentTaskViewSet, self).create(request, *args, **kwargs)
    def update(self, request, *args, **kwargs):
        if 'start_date' in request.data or 'end_date' in request.data:
            date_serializer = serializers.DateTimeField()
            task = AssignmentTask.objects.get(pk=kwargs['pk'])
            start_date = task.start_date
            end_date = task.end_date
            machine_pk = task.machine.pk
            patient_pk = task.patient.pk
            if 'start_date' in request.data:
                start_date = parseDate(request.data['start_date'])
            if 'end_date' in request.data:
                end_date = parseDate(request.data['end_date'])
            if 'machine' in request.data:
                machine_pk = int(request.data['machine'])
            if 'patient' in request.data:
                patient_pk = int(request.data['patient'])
            other_tasks_machine = AssignmentTask.objects.filter(machine__pk=machine_pk).exclude(pk=kwargs['pk'])
            other_tasks_patient = AssignmentTask.objects.filter(patient__pk=patient_pk).exclude(pk=kwargs['pk'])
            print([len(other_tasks_machine), len(other_tasks_patient)])
            if other_tasks_machine.filter(start_date__gt=start_date, end_date__lt=start_date) or other_tasks_machine.filter(start_date__gt=end_date, end_date__lt=end_date):
                return HttpResponseForbidden('403 Forbidden, machine busy', content_type='text/html')
            if other_tasks_patient.filter(start_date__gt=start_date, end_date__lt=start_date) or other_tasks_patient.filter(start_date__gt=end_date, end_date__lt=end_date):
                return HttpResponseForbidden('403 Forbidden, patient busy', content_type='text/html')
            if other_tasks_machine.filter(start_date__lt=start_date, end_date__gt=start_date) or other_tasks_machine.filter(start_date__lt=end_date, end_date__gt=end_date):
                return HttpResponseForbidden('403 Forbidden, machine busy', content_type='text/html')
            if other_tasks_patient.filter(start_date__lt=start_date, end_date__gt=start_date) or other_tasks_patient.filter(start_date__lt=end_date, end_date__gt=end_date):
                return HttpResponseForbidden('403 Forbidden, patient busy', content_type='text/html')
        return super(AssignmentTaskViewSet, self).update(request, *args, **kwargs)
    def partial_update(self, request, *args, **kwargs):
        if 'start_date' in request.data or 'end_date' in request.data:
            date_serializer = serializers.DateTimeField()
            task = AssignmentTask.objects.get(pk=kwargs['pk'])
            start_date = task.start_date
            end_date = task.end_date
            machine_pk = task.machine.pk
            patient_pk = task.patient.pk
            if 'start_date' in request.data:
                start_date = parseDate(request.data['start_date'])
            if 'end_date' in request.data:
                end_date = parseDate(request.data['end_date'])
            if 'machine' in request.data:
                machine_pk = int(request.data['machine'])
            if 'patient' in request.data:
                patient_pk = int(request.data['patient'])
            other_tasks_machine = AssignmentTask.objects.filter(machine__pk=machine_pk).exclude(pk=kwargs['pk'])
            other_tasks_patient = AssignmentTask.objects.filter(patient__pk=patient_pk).exclude(pk=kwargs['pk'])
            if other_tasks_machine.filter(start_date__gt=start_date, end_date__lt=start_date) or other_tasks_machine.filter(start_date__gt=end_date, end_date__lt=end_date):
                return HttpResponseForbidden('403 Forbidden, machine busy', content_type='text/html')
            if other_tasks_patient.filter(start_date__gt=start_date, end_date__lt=start_date) or other_tasks_patient.filter(start_date__gt=end_date, end_date__lt=end_date):
                return HttpResponseForbidden('403 Forbidden, patient busy', content_type='text/html')
            if other_tasks_machine.filter(start_date__lt=start_date, end_date__gt=start_date) or other_tasks_machine.filter(start_date__lt=end_date, end_date__gt=end_date):
                return HttpResponseForbidden('403 Forbidden, machine busy', content_type='text/html')
            if other_tasks_patient.filter(start_date__lt=start_date, end_date__gt=start_date) or other_tasks_patient.filter(start_date__lt=end_date, end_date__gt=end_date):
                return HttpResponseForbidden('403 Forbidden, patient busy', content_type='text/html')
        if 'bool_completed' in request.data or 'bool_install' in request.data:
            task = AssignmentTask.objects.get(pk=kwargs['pk'])
            if not (request.data['bool_completed'] == task.bool_completed and request.data['bool_install'] == task.bool_install):
                if not request.data['bool_completed']:
                    if not task.patient.machine_assigned is None:
                        return HttpResponseForbidden('403 Forbidden, machine already has a patient', content_type='text/html')
                    if not task.machine.patient_assigned is None:
                        return HttpResponseForbidden('403 Forbidden, patient already has a machine', content_type='text/html')
                    task.patient.machine_assigned = task.machine
                    task.machine.patient_assigned = task.patient
                else:
                    task.patient.machine_assigned = None
                    task.machine.patient_assigned = None
                task.patient.save()
                task.machine.save()
                task.save()
        return super(AssignmentTaskViewSet, self).partial_update(request, *args, **kwargs)
class AssignmentTaskQueryViewSet(viewsets.ModelViewSet):
    queryset = AssignmentTask.objects.all().order_by('date')
    serializer_class = AssignmentTaskSerializer
    permission_classes = [permissions.IsAuthenticated & PermissionTask]
    def get_queryset(self):
        if 'query' in self.kwargs:
            query = self.kwargs['query'].split('&')
            query = [q.split('=') for q in query]
            query = {q[0]:q[1] for q in query}
        return super().get_queryset().filter(**query)

class PermissionUser(permissions.BasePermission):
    def has_permission(self, request, view):
        try:
            if request.user.pk == 1 and request.method in permissions.SAFE_METHODS:
                return True
        except:
            return False
        return request.user.role.permission_user_edit or (request.user.role.permission_user_see and request.method in permissions.SAFE_METHODS)
class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated & PermissionUser]
"""
class CurrentUserViewSet(viewsets.ViewSet):
    queryset = User.objects.all()
    permission_classes = [permissions.IsAuthenticated]
    def retrieve(self, request):
        user = get_object_or_404(queryset, pk=request.user.pk)
        serializer = UserSerializer(user)
        return Response(serializer.data)
"""

class PermissionMessage(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.role.permission_message_edit or (request.user.role.permission_message_see and request.method in permissions.SAFE_METHODS)
class MessageViewSet(viewsets.ModelViewSet):
    queryset = Message.objects.all().order_by('-date')
    serializer_class = MessageSerializer
    permission_classes = [permissions.IsAuthenticated & PermissionMessage]
    def get_queryset(self):
        return super().get_queryset().filter(sender__pk=self.request.user.pk)
    def perform_create(self, serializer):
        serializer.save(sender=self.request.user)

class MessagePatientViewSet(viewsets.ModelViewSet):
    queryset = Message.objects.all().order_by('-date')
    serializer_class = MessageSerializer
    permission_classes = [permissions.IsAuthenticated & PermissionMessage]
    def get_queryset(self):
        return super().get_queryset().filter(patient__pk=self.kwargs['patient_pk'])
