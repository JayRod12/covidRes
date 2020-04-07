#!/bin/bash

BASE_DIR=/home/covidres/
DJANGO_DIR=$BASE_DIR/covidRes/

sudo echo "Running..." # Prompt for sudo passwd at start
cd $DJANGO_DIR
source venv/bin/activate


set +a
source $BASE_DIR/bin/default_conf.sh
echo "DATABASE to migrate: $DATABASE_NAME"
set -a
python manage.py makemigrations
python manage.py migrate

set +a
source $BASE_DIR/bin/nyon_conf.sh
set -a
echo "DATABASE to migrate: $DATABASE_NAME"
python manage.py makemigrations
python manage.py migrate

cd $DJANGO_DIR/frontend
npm install
sudo supervisorctl stop covidres
sudo supervisorctl stop covidres_nyon
npm run build

cd $DJANGO_DIR
python manage.py collectstatic --noinput
sudo supervisorctl start covidres
sudo supervisorctl start covidres_nyon
sudo service nginx restart
