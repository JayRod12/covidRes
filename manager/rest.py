from rest_framework import generics, permissions, viewsets, serializers
from rest_framework.response import Response
from django.http import HttpResponseForbidden

from django.shortcuts import get_object_or_404
import io
from rest_framework.parsers import JSONParser

from .models import Patient, MachineType, Location, Machine, AssignmentTask
from .models import User, Message, Role
from .serializers import (
    PatientSerializer,
    PatientDetailedSerializer,
    MachineTypeSerializer,
    LocationSerializer,
    MachineSerializer,
    MachineDetailedSerializer,
    AssignmentTaskSerializer
)
from .serializers import UserSerializer, MessageSerializer, RoleSerializer
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
        if request.user.role.permission_patient_edit or (request.user.role.permission_patient_see and request.method in permissions.SAFE_METHODS):
            return True
        else:
            try:
                if request.user.pk == Patient.objects.get(pk=view.kwargs['pk']).user.pk and request.method in permissions.SAFE_METHODS:
                    return True
            except:
                return False
            return False
class PatientViewSet(viewsets.ModelViewSet):
    pagination_class = None
    queryset = Patient.objects.all().order_by('name')
    serializer_class = PatientSerializer
    permission_classes = [permissions.IsAuthenticated & PermissionPatient]
    def get_serializer_class(self):
        if 'pk' in self.kwargs:
            return PatientDetailedSerializer
        return self.serializer_class
    def update(self, request, *args, **kwargs):
        if 'bool_connected' in request.data:
            patient = Patient.objects.get(pk=kwargs['pk'])
            if patient.machine_assigned is not None:
                patient.machine_assigned.bool_connected = request.data['bool_connected']
                patient.machine_assigned.save()
        return super().update(request, *args, **kwargs)
    def partial_update(self, request, *args, **kwargs):
        if 'bool_connected' in request.data:
            patient = Patient.objects.get(pk=kwargs['pk'])
            if patient.machine_assigned is not None:
                patient.machine_assigned.bool_connected = request.data.pop('bool_connected')
                patient.machine_assigned.save()
        return super().partial_update(request, *args, **kwargs)

class PermissionMachineType(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.role.permission_machinetype_edit or (request.user.role.permission_machinetype_see and request.method in permissions.SAFE_METHODS)
class MachineTypeViewSet(viewsets.ModelViewSet):
    pagination_class = None
    queryset = MachineType.objects.all().order_by('name')
    serializer_class = MachineTypeSerializer
    permission_classes = [permissions.IsAuthenticated & PermissionMachineType]

class PermissionLocation(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.role.permission_location_edit or (request.user.role.permission_location_see and request.method in permissions.SAFE_METHODS)
class LocationViewSet(viewsets.ModelViewSet):
    pagination_class = None
    queryset = Location.objects.all().order_by('name')
    serializer_class = LocationSerializer
    permission_classes = [permissions.IsAuthenticated & PermissionLocation]

class PermissionMachine(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.role.permission_machine_edit or (request.user.role.permission_machine_see and request.method in permissions.SAFE_METHODS)
class MachineViewSet(viewsets.ModelViewSet):
    pagination_class = None
    queryset = Machine.objects.all().order_by('location', 'model__name')
    serializer_class = MachineSerializer
    permission_classes = [permissions.IsAuthenticated & PermissionMachine]
    def get_serializer_class(self):
        if 'pk' in self.kwargs:
            return MachineDetailedSerializer
        return self.serializer_class
    def create(self, request, *args, **kwargs):
        if 'number' in request.data:
            number = int(request.data['number'])
            request.data.pop('number')
            for _ in range(number):
                output = super(MachineViewSet, self).create(request, *args, **kwargs)
            return output
        return super(MachineViewSet, self).create(request, *args, **kwargs)
class MachineQueryViewSet(viewsets.ModelViewSet):
    pagination_class = None
    queryset = Machine.objects.all().order_by('location', 'model__name')
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
        if request.user.role.permission_task_edit or (request.user.role.permission_task_see and request.method in permissions.SAFE_METHODS):
            return True
class AssignmentTaskViewSet(viewsets.ModelViewSet):
    pagination_class = None
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
                    task.machine.bool_connected = False
                task.patient.save()
                task.machine.save()
                task.save()
        return super(AssignmentTaskViewSet, self).partial_update(request, *args, **kwargs)
class AssignmentTaskQueryViewSet(viewsets.ModelViewSet):
    pagination_class = None
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
        if request.user.role.permission_user_edit or (request.user.role.permission_user_see and request.method in permissions.SAFE_METHODS):
            return True
        else:
            try:
                if request.user.pk == view.kwargs['pk'] and request.method in permissions.SAFE_METHODS:
                    return True
            except:
                return False
            return False
class UserViewSet(viewsets.ModelViewSet):
    pagination_class = None
    queryset = User.objects.all().order_by('username')
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated & PermissionUser]
    def partial_update(self, request, *args, **kwargs):
        if 'new_pass' in request.data:
            user = User.objects.get(pk=kwargs['pk'])
            user.set_password(request.data['new_pass'])
            user.save()
        return super(UserViewSet, self).partial_update(request, *args, **kwargs)

class PermissionMessage(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.role.permission_message_edit or (request.user.role.permission_message_see and request.method in permissions.SAFE_METHODS)
class MessageViewSet(viewsets.ModelViewSet):
    pagination_class = None
    queryset = Message.objects.all().order_by('-date')
    serializer_class = MessageSerializer
    permission_classes = [permissions.IsAuthenticated & PermissionMessage]
    def get_queryset(self):
        return super().get_queryset().filter(sender__pk=self.request.user.pk)
    def perform_create(self, serializer):
        serializer.save(sender=self.request.user)

class PermissionPatientMessage(permissions.BasePermission):
    def has_permission(self, request, view):
        if request.user.role.permission_message_edit or (request.user.role.permission_message_see and request.method in permissions.SAFE_METHODS):
            return True
        else:
            try:
                if request.user.pk == Patient.objects.get(pk=view.kwargs['patient_pk']).user.pk and request.method in permissions.SAFE_METHODS:
                    return True
            except:
                return False
            return False
class MessagePatientViewSet(viewsets.ModelViewSet):
    pagination_class = None
    queryset = Message.objects.all().order_by('-date')
    serializer_class = MessageSerializer
    permission_classes = [permissions.IsAuthenticated & PermissionPatientMessage]
    def get_queryset(self):
        return super().get_queryset().filter(patient__pk=self.kwargs['patient_pk'])

class PermissionRole(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.role.permission_role_edit or (request.user.role.permission_role_see and request.method in permissions.SAFE_METHODS)
class RoleViewSet(viewsets.ModelViewSet):
    pagination_class = None
    queryset = Role.objects.all().order_by('name')
    serializer_class = RoleSerializer
    permission_classes = [permissions.IsAuthenticated & PermissionRole]
