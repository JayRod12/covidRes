from django.urls import include, path
from rest_framework import routers
from . import views

router = routers.DefaultRouter()
router.register(r'patients', views.PatientViewSet)
router.register(r'machines', views.MachineViewSet)

app_name = 'resourceManager'
# Old views based on django templates
urlpatterns = [
    path('', views.HomeView.as_view(), name='index'),
    path('patient/<int:patient_id>/', views.PatientDetailView.as_view(), name='patient_detail'),
    path('machine/<int:machine_id>/', views.MachineDetailView.as_view(), name='machine_detail'),
    path('machine_calendar/', views.MachineCalendarView.as_view(), name='machine_calendar'),
]