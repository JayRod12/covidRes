from django import forms
from django.contrib.auth.forms import UserCreationForm
from django.db import transaction

from .models import Nurse, User

# Unused for now
class NurseSignUpForm(UserCreationForm):

    class Meta(UserCreationForm.Meta):
        model = User

    @transaction.atomic
    def save(self):
        user = super().save(commit=False)
        user.is_nurse = True
        user.save()
        student = Nurse.objects.create(user=user)
        return user