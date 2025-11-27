import multiprocessing
import os

# Server socket
bind = "unix:/var/www/html/biolock/backend/gunicorn.sock"
backlog = 2048

# Worker processes
workers = multiprocessing.cpu_count() * 2 + 1
worker_class = 'sync'
worker_connections = 1000
timeout = 120
keepalive = 5

# Logging
accesslog = '/var/log/biolock/gunicorn-access.log'
errorlog = '/var/log/biolock/gunicorn-error.log'
loglevel = 'info'
access_log_format = '%(h)s %(l)s %(u)s %(t)s "%(r)s" %(s)s %(b)s "%(f)s" "%(a)s"'

# Process naming
proc_name = 'biolock_backend'

# Server mechanics
daemon = False
pidfile = '/var/www/html/biolock/backend/gunicorn.pid'
user = 'www-data'
group = 'www-data'

# Django WSGI application path
wsgi_app = 'backend.wsgi:application'

# Environment variables
raw_env = [
    'DJANGO_SETTINGS_MODULE=backend.settings',
]
