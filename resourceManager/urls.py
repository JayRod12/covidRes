from django.urls import path

from . import views
app_name = 'resourceManager'
urlpatterns = [
    path('', views.index, name='index'),
    path('patient/<int:patient_id>/', views.detail, name='patient_detail'),
    path('machine/<int:machine_id>/', views.machine_detail, name='machine_detail'),
    path('<int:patient_id>/assign_machine', views.detail, name='assign_machine'),
]