### Running Backend on Virtual Environment

- Run `python3 -m venv env` outside backend directory
- Run `source env/bin/activate` to activate env, Run `deactivate` to deactivate env
- Run `pip install -r requirements.txt`
- Navigate to backend directory `cd backend`
- Run `python manage.py makemigrations` to create migrations
- Run `python manage.py migrate` to apply migrations
- Run `python manage.py runserver` to run django server