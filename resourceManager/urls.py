from django.urls import path

from . import views
app_name = 'resourceManager'
urlpatterns = [
    path('', views.index, name='index'),
    path('<int:patient_id>/', views.detail, name='detail'),
    path('<int:patient_id>/assign_machine', views.detail, name='assign_machine'),
]