from django.contrib.auth import authenticate, login, logout
from .models import User

def login_view(request):
    username = request.POST['username']
    password = request.POST['password']
    user = authenticate(request, username=username, password=password)
    if user is not None:
        login(request, user)
        return HttpResponse(user.role.name) # Return role when login
    else:
        return HttpResponse("Wrong credentials") # Return this

def logout_view(request):
    logout(request)
    return HttpResponse("Success")

def password_view(request):
    username = request.POST['username']
    password_old = request.POST['possword_old']
    password = request.POST['possword']
    user = authenticate(request, username=username, password=password_old)
    if user is not None:
        user.set_password(password)
        return("Success")
    else:
        return("Wrong credentials")
