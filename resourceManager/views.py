from django.shortcuts import render
from django.http import Http404
from django.template import loader

from .models import Patient, Machine


# Create your views here.


from django.http import HttpResponse


def index(request):
	latest_registered_patients = Patient.objects.order_by('-admission_date')[:10]
	machines = Machine.objects.all()
	template = loader.get_template('resourceManager/index.html')
	labels = []
	data = []
	labels_m = []
	data_m = []
	for patient in latest_registered_patients:
		labels.append(patient.name)
		data.append(patient.severity)
	
	locations_count=Machine.objects.values('location').distinct()
	locations_distinct=[]
	for i in range(len(locations_count)):
		locations_distinct.append(locations_count[i]['location'])
	
	data_loc=[]
	for loc in locations_distinct:
		d=[]
		d=Machine.objects.filter(location=loc)
		data_loc.append(len(d))

	context = {
		'latest_registered_patients': latest_registered_patients,
		'machines': machines,
		'labels':labels,
		'data':data,
		'da':locations_distinct,
		'data_loc': data_loc,
	}
	return render(request, 'resourceManager/index.html', context)

def patient_detail(request, patient_id):
	try:
		patient = Patient.objects.get(pk=patient_id)
	except Patient.DoesNotExist:
		raise Http404("Patient does not exist")
	return render(request, 'resourceManager/patient_detail.html', {'patient' : patient})

def availability(request):
	context = {}
	return render(request, 'resourceManager/availability.html', context)

def machine_detail(request, machine_id):
	try:
		machine = Machine.objects.get(pk=machine_id)
	except Patient.DoesNotExist:
		raise Http404("Machine does not exist")
	loc_machines = Machine.objects.filter(location=machine.location).exclude(id=machine_id)
	model_machines = Machine.objects.filter(model=machine.model).exclude(id=machine_id)
	return render(
		request,
		'resourceManager/machine_detail.html',
		{
			'machine' : machine,
			'loc_machines': loc_machines,
			'model_machines': model_machines,
		})

