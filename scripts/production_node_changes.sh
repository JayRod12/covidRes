#!/bin/bash

python manage.py makemigrations
python manage.py migrate
cd /home/covidres/covidRes/frontend
npm install
sudo supervisorctl stop covidres
npm run build
cd ..
python manage.py collectstatic --noinput
sudo supervisorctl start covidres
sudo service nginx restart
