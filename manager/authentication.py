from django.contrib.auth import authenticate, login, logout
from .models import User
from django.http import HttpResponse
import json

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
    password_old = request.POST['password_old']
    password = request.POST['password']
    user = authenticate(request, username=username, password=password_old)
    if user is not None:
        user.set_password(password)
        return("Success")
    else:
        return("Wrong credentials")

def user_view(request):
    if request.user is not None:
        user = request.user
        if user.role is not None:
            perm_str = "permission"
            answer = vars(user.role)
            answer = {key: answer[key] for key in answer if isinstance(key, str) and len(key) > len(perm_str) and key[:len(perm_str)] == perm_str}
            answer["username"] = user.username
            answer["role"] = user.role.name
        else:
            answer = {
                "username": user.username,
                "role": None
            }
        return HttpResponse(json.dumps(answer))
    else:
        return HttpResponse("Not logged in")