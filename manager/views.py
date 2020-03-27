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

from .models import Patient, MachineType, Machine
from .serializers import PatientSerializer, MachineTypeSerializer, MachineSerializer
from django.utils import timezone
import json

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

# Main pages
def patients(request):
    return render(request, 'patients.html', {'patients': Patient.objects.all()})

def machines(request):
    return render(request, 'machines.html', {'machines': Machine.objects.all()})

# Details
def patient(request, pk):
    try:
        patient = Patient.objects.get(pk=pk)
        if patient.machine_pk == 0:
            return render(request, 'patient.html', {'patient': patient, 'history_severity': patient.get_history_severity(), 'history_machine': patient.get_history_machine()})
        else:
            machine = Machine.objects.get(pk=patient.machine_pk)
            return render(request, 'patient.html', {'patient': patient, 'history_severity': patient.get_history_severity(), 'history_machine': patient.get_history_machine(), 'machine': machine})
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
    machines = [machine for machine in Machine.objects.all() if machine.model.pk == machinetype_pk and machine.patient_pk == 0]
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
    if len(patient.history_machine_y)==0:
        patient.history_machine_x = str(timezone.now())[:-3] + str(timezone.now())[-2:]
        patient.history_machine_y = str(machine_pk)
        patient.save()
    elif not machine_pk == int(patient.history_machine_y.split(', ')[-1]):
        patient.history_machine_x += ', ' + str(timezone.now())[:-3] + str(timezone.now())[-2:]
        patient.history_machine_y += ', ' + str(machine_pk)
        patient.save()
    return redirect('patient', pk)
