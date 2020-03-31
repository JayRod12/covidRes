#!/bin/bash

cd /home/covidres/covidRes/frontend
npm install
sudo supervisorctl stop covidres
npm run build
cd ..
python manage.py collectstatic
sudo supervisorctl start covidres
sudo service nginx restart
