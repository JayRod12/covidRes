import os
from .base import *

# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/3.0/howto/deployment/checklist/

# Key used only for local dev
SECRET_KEY = 'se1zi%cjgt3sv(rqb4ah6hef^@ua60rhion$%y84*_1xa7pp)6'

DEBUG = True

ALLOWED_HOSTS = ['127.0.0.1', 'localhost']

# Database for local dev
# https://docs.djangoproject.com/en/3.0/ref/settings/#databases

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql_psycopg2',
        'NAME': 'local_db',
        'USER': 'test',
        'PASSWORD': 'test',
        'HOST': 'localhost',
        'PORT': '',
    }
}

