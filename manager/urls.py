from django.urls import path

from . import views

urlpatterns = [
    path('', views.home, name='home'),
    path('patients/', views.patients, name='patients'),
    path('patient/<int:pk>/', views.patient, name='patient'),
    path('patient/create/', views.patient_create.as_view(), name='patient-create'),
    path('patient/<int:pk>/update/', views.patient_update.as_view(), name='patient-update'),
    path('patient/<int:pk>/machinetype/', views.patient_machinetype, name='patient-machinetype'),
    path('patient/<int:pk>/machines/<int:machinetype_pk>/', views.patient_machine, name='patient-machine'),
    path('patient/<int:pk>/assign/<int:machine_pk>/', views.patient_assign, name='patient-assign'),
    path('machines/', views.machines, name='machines'),
    path('machine/<int:pk>/', views.machine, name='machine'),
    path('machine/create/', views.machine_create.as_view(), name='machine-create'),
    path('machine/<int:pk>/update/', views.machine_update.as_view(), name='machine-update'),
    path('tasks/', views.tasks, name='tasks'),
    path('assignment_task/<int:pk>/', views.assignment_task, name='assignment_task'),
    path('assignment_task/create/', views.assignment_task_create.as_view(), name='assignment_task-create'),
    path('assignment_task/<int:pk>/update/', views.assignment_task_update.as_view(), name='assignment_task-update'),
    path('assignment_task/<int:pk>/complete/', views.assignment_task_complete, name='assignment_task-complete'),
]
