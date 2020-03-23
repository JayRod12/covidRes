from django.urls import path

from . import views
app_name = 'resourceManager'
urlpatterns = [
    path('', views.HomeView.as_view(), name='index'),
    path('patient/<int:patient_id>/', views.PatientDetailView.as_view(), name='patient_detail'),
    path('machine/<int:machine_id>/', views.MachineDetailView.as_view(), name='machine_detail'),
    path('machine_calendar/', views.MachineCalendarView.as_view(), name='machine_calendar'),
]