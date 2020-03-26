from django.urls import include, path
from rest_framework import routers
from . import views

router = routers.DefaultRouter()
router.register(r'patients', views.PatientViewSet)
router.register(r'machines', views.MachineViewSet)

app_name = 'resourceManager'
urlpatterns = [
    path('', views.HomeView.as_view(), name='index'),
    # New API views for use with react
    path('', include(router.urls)),
    path('api-auth/', include('rest_framework.urls', namespace='rest_framework')),
    # Old views based on django templates
    path('patient/<int:patient_id>/', views.PatientDetailView.as_view(), name='patient_detail'),
    path('machine/<int:machine_id>/', views.MachineDetailView.as_view(), name='machine_detail'),
    path('machine_calendar/', views.MachineCalendarView.as_view(), name='machine_calendar'),

]