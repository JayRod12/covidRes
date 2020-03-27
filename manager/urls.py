from django.urls import path

from . import views

urlpatterns = [
    path('', views.home, name='home'),
    path('patients/', views.patients, name='patients'),
    path('machines/', views.machines, name='machines'),
    path('patient/<int:pk>/', views.patient, name='patient'),
    path('patient/create/', views.patient_create.as_view(), name='patient-create'),
    path('patient/<int:pk>/update/', views.patient_update.as_view(), name='patient-update'),
    path('patient/<int:pk>/machinetype/', views.patient_machinetype, name='patient-machinetype'),
    path('patient/<int:pk>/machines/<int:machinetype_pk>/', views.patient_machine, name='patient-machine'),
    path('patient/<int:pk>/assign/<int:machine_pk>/', views.patient_assign, name='patient-assign'),
    path('machine/<int:pk>/', views.machine, name='machine'),
    path('machine/create/', views.machine_create.as_view(), name='machine-create'),
    path('machine/<int:pk>/update/', views.machine_update.as_view(), name='machine-update'),
]
