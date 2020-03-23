import os
import random
"""
Two things are wrong with Django's default `SECRET_KEY` system:
1. It is not random but pseudo-random
2. It saves and displays the SECRET_KEY in `settings.py`
This snippet
1. uses `SystemRandom()` instead to generate a random key
2. saves a local `secret.txt`
The result is a random and safely hidden `SECRET_KEY`.
"""
PROJECT_PATH='/home/covidres/'

SECRET_FILE = os.path.join(PROJECT_PATH, 'secret.txt')
SECRET_KEY = ''.join([random.SystemRandom().choice('abcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*(-_=+)') for i in range(50)])
with open(SECRET_FILE, 'w') as secret:
    secret.write(SECRET_KEY)
