"""
Django settings for covidRes project.

Generated by 'django-admin startproject' using Django 3.0.4.

For more information on this file, see
https://docs.djangoproject.com/en/3.0/topics/settings/

For the full list of settings and their values, see
https://docs.djangoproject.com/en/3.0/ref/settings/
"""

import os
from .base_settings import *
from django.core.exceptions import ImproperlyConfigured

# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/3.0/howto/deployment/checklist/

# Use secret-key-gen.py to generate a new one
# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = False

ALLOWED_HOSTS = ['covidmanager.ch', '178.62.120.24', '127.0.0.1', 'localhost']

# Database
# https://docs.djangoproject.com/en/3.0/ref/settings/#databases
def get_env_value(env_variable):
    try:
      	return os.environ[env_variable]
    except KeyError:
        error_msg = 'Set the {} environment variable'.format(env_variable)
        raise ImproperlyConfigured(error_msg)

# Set from Hypervisor config (/etc/supervisor/conf.d/covidres.conf)
SECRET_KEY = get_env_value('DJANGO_SECRET_KEY')

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql_psycopg2',
	'NAME': get_env_value('DATABASE_NAME'),
	'USER': get_env_value('DATABASE_USER'),
	'PASSWORD': get_env_value('DATABASE_PASSWORD'),
	'HOST': get_env_value('DATABASE_HOST'),
	'PORT': '',
    }
}

