from django.shortcuts import render, redirect
from django.urls import reverse
from django.http import Http404
from django.contrib.auth.mixins import LoginRequiredMixin, UserPassesTestMixin
from django.views.generic import (
    ListView,
    DetailView,
    CreateView,
    UpdateView,
    DeleteView
)

from rest_framework import generics, permissions, viewsets

from .models import Patient, MachineType, Machine, AssignmetTask
from .models import User, Message
from .serializers import PatientSerializer, MachineTypeSerializer, MachineSerializer, AssignmetTaskSerializer
from .serializers import UserSerializer, MessageSerializer
from .serializers import User, Message
from django.utils import timezone
import json

from . import functions

# Home
def home(request):
    return render(request, 'home.html')

# REST
class PatientViewSet(viewsets.ModelViewSet):
    queryset = Patient.objects.all().order_by('-admission_date')
    serializer_class = PatientSerializer
    permission_classes = [permissions.IsAuthenticated]

class MachineTypeViewSet(viewsets.ModelViewSet):
    queryset = MachineType.objects.all()
    serializer_class = MachineTypeSerializer
    permission_classes = [permissions.IsAdminUser]

class MachineViewSet(viewsets.ModelViewSet):
    queryset = Machine.objects.all()
    serializer_class = MachineSerializer
    permission_classes = [permissions.IsAdminUser]

class AssignmetTaskViewSet(viewsets.ModelViewSet):
    queryset = AssignmetTask.objects.all()
    serializer_class = AssignmetTaskSerializer
    permission_classes = [permissions.IsAdminUser]

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAdminUser]

class MessageViewSet(viewsets.ModelViewSet):
    queryset = Message.objects.all()
    serializer_class = MessageSerializer
    permission_classes = [permissions.IsAdminUser]

# Main pages
def patients(request):
    return render(request, 'patients.html', {'patients': Patient.objects.all()})

def machines(request):
    return render(request, 'machines.html', {'machines': Machine.objects.all()})

def tasks(request):
    return render(request, 'tasks.html', {'assignment_tasks': AssignmetTask.objects.filter(bool_completed=False).order_by('date')})

# Details
def patient(request, pk):
    try:
        patient = Patient.objects.get(pk=pk)
        if patient.machine_pk == 0:
            return render(request, 'patient.html', {
                'patient': patient,
                'history_severity': patient.get_history_severity(),
                'history_machine': patient.get_history_machine(),
                'tasks': functions.get_assignment_tasks(patient)
            })
        else:
            machine = Machine.objects.get(pk=patient.machine_pk)
            return render(request, 'patient.html', {
                'patient': patient,
                'history_severity': patient.get_history_severity(),
                'history_machine': patient.get_history_machine(),
                'tasks': functions.get_assignment_tasks(patient),
                'machine': machine
            })
    except Patient.DoesNotExist:
        raise Http404("Patient not found")
    except Machine.DoesNotExist:
        raise Http404("Machine not found")

def machine(request, pk):
    try:
        machine = Machine.objects.get(pk=pk)
    except Machine.DoesNotExist:
        raise Http404("Machine not found")
    return render(request, 'machine.html', {'machine': machine})

def assignment_task(request, pk):
    try:
        task = AssignmetTask.objects.get(pk=pk)
    except AssignmetTask.DoesNotExist:
        raise Http404("AssignmetTask not found")
    return render(request, 'assignment_task.html', {'task': task})

# Create
class patient_create(LoginRequiredMixin, CreateView):
    model = Patient
    template_name = 'generic_form.html'
    fields = ['name', 'severity', 'description']
    def form_valid(self, form):
        form.instance.history_severity_x = str(timezone.now())[:-3] + str(timezone.now())[-2:]
        form.instance.history_severity_y = str(form.instance.severity)
        return super().form_valid(form)

class machine_create(LoginRequiredMixin, CreateView):
    model = Machine
    template_name = 'generic_form.html'
    fields = ['model', 'location', 'description']

class assignment_task_create(LoginRequiredMixin, CreateView):
    model = AssignmetTask
    template_name = 'generic_form.html'
    fields = ['patient', 'machine', 'start_date', 'end_date']
    def form_valid(self, form):
        form.instance.date = form.instance.start_date
        return super().form_valid(form)

# Edit
class patient_update(LoginRequiredMixin, UpdateView):
    model = Patient
    template_name = 'generic_form.html'
    fields = ['name', 'severity', 'description']
    def form_valid(self, form):
        if not form.instance.severity == int(form.instance.history_severity_y.split(', ')[-1]):
            form.instance.history_severity_x += ', ' + str(timezone.now())[:-3] + str(timezone.now())[-2:]
            form.instance.history_severity_y += ', ' + str(form.instance.severity)
        return super().form_valid(form)

class machine_update(LoginRequiredMixin, UpdateView):
    model = Machine
    template_name = 'generic_form.html'
    fields = ['model', 'location', 'description']

class assignment_task_update(LoginRequiredMixin, UpdateView):
    model = AssignmetTask
    template_name = 'generic_form.html'
    fields = ['patient', 'machine', 'bool_install', 'start_date', 'end_date']
    def form_valid(self, form):
        if form.instance.bool_install:
            form.instance.date = form.instance.end_date
        else:
            form.instance.date = form.instance.start_date
        return super().form_valid(form)

# Assign machine to patient
def patient_machinetype(request, pk):
    try:
        patient = Patient.objects.get(pk=pk)
    except Patient.DoesNotExist:
        raise Http404("Patient not found")
    machines = Machine.objects.all()
    machinetypes = MachineType.objects.all()
    machinetypes_count = {machinetype.pk:0 for machinetype in machinetypes}
    for machine in machines:
        if machine.patient_pk == 0:
            machinetypes_count[machine.model.pk] += 1
    machinetypes_count = [machinetypes_count[machinetype.pk] for machinetype in machinetypes]
    machinetypes_plus = [{'machinetype': machinetype, 'count':count} for machinetype, count in zip(machinetypes, machinetypes_count)]
    return render(request, 'patient_machinetype.html', {'pk': pk, 'machinetypes_plus': machinetypes_plus})

def patient_machine(request, pk, machinetype_pk):
    try:
        patient = Patient.objects.get(pk=pk)
    except Patient.DoesNotExist:
        raise Http404("Patient not found")
    machines = Machine.objects.filter(model__pk=machinetype_pk).filter(patient_pk=0)
    return render(request, 'patient_machine.html', {'pk': pk, 'machines': machines})

def patient_assign(request, pk, machine_pk):
    try:
        patient = Patient.objects.get(pk=pk)
        if machine_pk == 0:
            if not patient.machine_pk == 0:
                machine_old = Machine.objects.get(pk=patient.machine_pk)
                machine_old.patient_pk = 0 # Unassign from old machine
                machine_old.save()
            patient.machine_pk = 0
            patient.save()
        else:
            machine = Machine.objects.get(pk=machine_pk)
            if machine.patient_pk == 0:
                if not patient.machine_pk == 0:
                    machine_old = Machine.objects.get(pk=patient.machine_pk)
                    machine_old.patient_pk = 0 # Unassign from old machine
                    machine_old.save()
                patient.machine_pk = machine_pk # Assign new machine
                machine.patient_pk = pk # Assign to new machine
                patient.save()
                machine.save()
            else:
                raise Http404("Machine taken")
    except Patient.DoesNotExist:
        raise Http404("Patient not found")
    except Machine.DoesNotExist:
        raise Http404("Machine not found")
    patient.assign_machine(machine_pk)
    patient.save()
    return redirect('patient', pk)

# Task completion
def assignment_task_complete(request, pk):
    try:
        task = AssignmetTask.objects.get(pk=pk)
        if task.bool_completed:
            raise Http404("Task was already completed")
        patient = Patient.objects.get(pk=task.patient.pk) ######### THER MUST BE A BETTER WAY #########
        machine = Machine.objects.get(pk=task.machine.pk) #############################################
        if not task.bool_install: # We assume both patient and machine are unassigned
            patient.assign_machine(machine.pk)
            machine.patient_pk = patient.pk
            task.bool_install = True
            task.date = task.end_date
        else:
            patient.assign_machine(0)
            machine.patient_pk = 0
            task.bool_completed = True
        task.save()
        patient.save()
        machine.save()
        return redirect('tasks')
    except AssignmetTask.DoesNotExist:
        raise Http404("Task not found")
