
# Steps to setup local server

The project uses Python3

Use `pip3 install -r <DEP>` to install `django`, `virtualenv`, `djangorestframework` and so on to install dependencies.

```
virtualenv venv
source venv/bin/activate
pip install -r requirements.txt
python manage.py runserver
```

# Developing React
```
cd frontend/
npm install
npm run dev
# If server isn't already running
python manage.py runserver
```
