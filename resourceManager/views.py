from datetime import datetime, timedelta
from django.shortcuts import render
from django.http import Http404, HttpResponse
import numpy as np
from .models import Patient, Machine, MachineAssignment

def chart_data(patients):
    labels = []
    data = []
    for patient in patients:
        labels.append(patient.name)
        data.append(patient.severity)

    # this is the data for the bar plot, total values of locations
    locations_distinct = []
    for loc_count in Machine.objects.values('location').distinct():
        locations_distinct.append(loc_count['location'])

    data_loc = []
    for loc in locations_distinct:
        data_loc.append(len(Machine.objects.filter(location=loc)))

    #List of machines assigned today
    date = datetime.now()
    assig_today = MachineAssignment.objects.filter(start_date__lte=date, end_date__gte=date)
    locations_of_machines_today = []
    for assig in assig_today:
        locations_of_machines_today.append(assig.machine.location)

    data_machines_used_today = []
    for loc in locations_distinct:
        d = []
        for a in locations_of_machines_today:
            d.append(a == loc)
        data_machines_used_today.append(np.sum(d))

    return (labels, data, locations_distinct, data_loc, data_machines_used_today)


def index(request):
    latest_registered_patients = Patient.objects.order_by('-admission_date')[:10]
    machines = Machine.objects.all()
    labels, data, locations_distinct, data_total_machines, data_machines_used_today \
        = chart_data(latest_registered_patients)

    context = {
        'latest_registered_patients': latest_registered_patients,
        'machines': machines,
        'labels_patients': labels,
        'data_patients' : data,
        'label_location_machines' : locations_distinct,
        'data_total_machines' : data_total_machines,
        'data_machines_used_today': data_machines_used_today,
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

def machine_calendar(request):
    return render(request, 'resourceManager/machine_calendar.html', {})
