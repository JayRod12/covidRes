"""covidRes URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/3.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import include, path, re_path
from rest_framework import routers
from frontend import views as react_views
#from resourceManager import views
from manager import rest as views_manager
from manager import authentication as views_auth
from manager.views import roll

router = routers.DefaultRouter()
#router.register(r'patients', views.PatientViewSet)
#router.register(r'machines', views.MachineViewSet)
#router.register(r'machine_assignments', views.MachineAssignmentViewSet)
#router.register(r'rest/user', views_manager.CurrentUserViewSet),
router.register(r'rest/patients', views_manager.PatientViewSet),
router.register(r'rest/machinetypes', views_manager.MachineTypeViewSet),
router.register(r'rest/machines', views_manager.MachineViewSet),
router.register(r'^rest/machines/query/(?P<query>.+)', views_manager.MachineQueryViewSet),
router.register(r'rest/assignment_tasks', views_manager.AssignmentTaskViewSet),
router.register(r'^rest/assignment_tasks/query/(?P<query>.+)', views_manager.AssignmentTaskQueryViewSet),
router.register(r'rest/users', views_manager.UserViewSet),
router.register(r'rest/messages', views_manager.MessageViewSet),
router.register(r'rest/messages/to/(?P<patient_pk>.+)', views_manager.MessagePatientViewSet),


urlpatterns = [
    path('admin/', admin.site.urls, name='admin'),
    path('', react_views.index),
    path('', include(router.urls)),
    path('api-auth/', include('rest_framework.urls', namespace='rest_framework')),
    #path('', include('resourceManager.urls')), # template based views
    path('manager/', include('manager.urls')), # template based views
    path('login/', views_auth.login_view),
    path('logout/', views_auth.logout_view),
    path('password/', views_auth.password_view),
    path('myself/', views_auth.user_view),
    path('secret/', roll),
    re_path(r'^(?:.*)/?$', react_views.index),
]
