from django.shortcuts import render
from django.http import Http404
from django.template import loader

from .models import Patient, Machine


# Create your views here.


from django.http import HttpResponse


def index(request):
	latest_registered_patients = Patient.objects.order_by('-admission_date')[:10]
	output = ", ".join([p.name for p in latest_registered_patients])

	template = loader.get_template('resourceManager/index.html')
	context = {
		'latest_registered_patients': latest_registered_patients,
	}
	return render(request, 'resourceManager/index.html', context)

def detail(request, patient_id):
	try:
		patient = Patient.objects.get(pk=patient_id)
	except Patient.DoesNotExist:
		raise Http404("Patient does not exist")
	return render(request, 'resourceManager/patient_detail.html', {'patient' : patient})

def assign_machine(request, patient_id):
	return HttpResponse("Assigning machine to patient {}.".format(patient_id))

def availability(request):
	context = {}
	return render(request, 'resourceManager/availability.html', context)

def machine_detail(request, machine_id):
	try:
		machine = Machine.objects.get(pk=machine_id)
	except Patient.DoesNotExist:
		raise Http404("Machine does not exist")
	loc_machines = Machine.objects.filter(location=machine.location)
	return render(request, 'resourceManager/machine_detail.html', {'machine' : machine, 'loc_machines': loc_machines})

