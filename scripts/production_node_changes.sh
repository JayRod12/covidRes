#!/bin/bash

cd /home/covidres/covidRes/frontend
npm run dev
cd ..
python manage.py collectstatic
sudo supervisorctl restart covidres
