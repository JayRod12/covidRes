from datetime import datetime
from django.views.generic import TemplateView, ListView, DetailView, CreateView
from django.utils import timezone
from rest_framework import generics
from rest_framework import permissions
from rest_framework import viewsets
from .forms import NurseSignUpForm
from .models import Patient, Machine, MachineAssignment, User
from .serializers import PatientSerializer, MachineSerializer, MachineAssignmentSerializer

# Rest API views
class IsDoctor(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_doctor

class IsFamily(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_family

class IsNurse(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_nurse

class PatientViewSet(viewsets.ModelViewSet):
    queryset = Patient.objects.all().order_by('-admission_date')
    serializer_class = PatientSerializer
    permission_classes = [permissions.IsAuthenticated & (permissions.IsAdminUser | IsDoctor | IsNurse)]

class MachineViewSet(viewsets.ModelViewSet):
    queryset = Machine.objects.all()
    serializer_class = MachineSerializer
    permission_classes = [permissions.IsAdminUser | IsDoctor | IsNurse]

class MachineAssignmentViewSet(viewsets.ModelViewSet):
    queryset = MachineAssignment.objects.all()
    serializer_class = MachineAssignmentSerializer
    permission_classes = [permissions.IsAdminUser | IsDoctor | IsNurse]

class HomeView(TemplateView):
    template_name = 'resourceManager/index.html'

    @staticmethod
    def machines_available_today():
        today = timezone.now()
        assignments = MachineAssignment.objects.filter(start_date__lte=today, end_date__gte=today)
        return [assignment.machine.location for assignment in assignments]

    @staticmethod
    def get_total_machines(locations):
        return [Machine.objects.filter(location=loc).count() for loc in locations]

    def get_machines_used_today(self, locations):
        machines_today = self.machines_available_today()
        return [
            sum(1 for machine in machines_today if machine == loc) for loc in locations
        ]

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        patients = Patient.objects.order_by('-admission_date')[:10]
        locations = list(Machine.objects.values_list('location', flat=True).distinct())
        context.update({
            'machines': Machine.objects.all(),
            'latest_registered_patients': patients,
            'patients_graph': [(p.name, p.severity) for p in patients],
            'label_location_machines': locations,
            'data_total_machines': self.get_total_machines(locations),
            'data_machines_used_today': self.get_machines_used_today(locations),
        })
        return context


class PatientDetailView(DetailView):
    model = Patient
    context_object_name = 'patient'


class AvailabilityView(TemplateView):
    template_name = 'resourceManager/availability.html'


class MachineDetailView(DetailView):
    model = Machine
    context_object_name = 'machine'

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        machine = self.get_object()
        context.update({
            'loc_machines': Machine.objects.filter(location=machine.location).exclude(id=machine.pk),
            'model_machines': Machine.objects.filter(model=machine.model).exclude(id=machine.pk)
        })
        return context


class MachineCalendarView(ListView):
    template_name = 'resourceManager/machine_calendar.html'
    queryset = Machine.objects.all()
    context_object_name = 'machines'
