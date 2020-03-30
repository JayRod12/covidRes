#!/bin/bash

cd /home/covidres/covidRes/frontend
npm install
npm run dev
cd ..
python manage.py collectstatic
sudo supervisorctl restart covidres
