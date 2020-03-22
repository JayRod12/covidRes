from django.shortcuts import render
from django.http import Http404
from django.template import loader

from .models import Patient


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
	return render(request, 'resourceManager/detail.html', {'patient' : patient})

def assign_machine(request, patient_id):
	return HttpResponse("Assigning machine to patient {}.".format(patient_id))

