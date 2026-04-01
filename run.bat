@echo off
echo --- Starting Match-and-Dine Servers ---

echo Starting Django Backend in a new window...
start "Django Backend" cmd /k "venv\Scripts\activate.bat && python core\manage.py runserver"

echo Starting Vite Frontend in a new window...
start "Vite Frontend" cmd /k "cd core\frontend && npm run dev"

echo Both servers are starting up. Close the new command prompt windows to stop them.