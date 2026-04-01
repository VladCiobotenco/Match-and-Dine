#!/bin/bash

echo "--- Starting Match-and-Dine Servers ---"

echo "Starting Django Backend..."
source venv/bin/activate && python core/manage.py runserver &
BACKEND_PID=$!

echo "Starting Vite Frontend..."
(cd core/frontend && npm run dev) &
FRONTEND_PID=$!

# Catch termination signals (like Ctrl+C) to stop both servers gracefully
trap "echo 'Stopping servers...'; kill $BACKEND_PID $FRONTEND_PID; exit" SIGINT SIGTERM EXIT

echo "Both servers are running. Press Ctrl+C to stop them both."
wait