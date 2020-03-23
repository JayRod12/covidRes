from datetime import datetime
from django.views.generic import TemplateView, ListView, DetailView

from .models import Patient, Machine, MachineAssignment


class HomeView(TemplateView):
    template_name = 'resourceManager/index.html'

    @staticmethod
    def machines_available_today():
        date = datetime.now()
        assignments = MachineAssignment.objects.filter(start_date__lte=date, end_date__gte=date)
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
        locations = Machine.objects.values_list('location', flat=True).distinct()
        context.update({
            'machines': Machine.objects.all(),
            'latest_registered_patients': patients,
            'patients_graph': [(p.name, p.severity) for p in patients],
            'label_location_machines': locations,
            'data_total_machines': self.get_total_machines(locations),
            'data_machines_used_today': self.get_machines_used_today(locations),
        })


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
