#!/bin/bash

cd /home/covidres/covidRes/frontend
npm install
npm run build
cd ..
python manage.py collectstatic
sudo supervisorctl restart covidres
sudo service nginx restart
