#!/bin/bash
set -e # Exit immediately if a command exits with a non-zero status.

echo "--- Starting project setup ---"

# 1. Check for Python 3
if ! command -v python3 &> /dev/null
then
    echo "Python 3 could not be found. Please install Python 3."
    exit 1
fi

# 2. Create a virtual environment
echo "--- Creating Python virtual environment in 'venv' ---"
python3 -m venv venv

# 3. Install Python dependencies
echo "--- Installing Python dependencies from requirements.txt ---"
venv/bin/pip install -r requirements.txt

# 4. Check for Node.js and npm
if ! command -v npm &> /dev/null
then
    echo "npm could not be found. Please install Node.js and npm."
    exit 1
fi

# 5. Install frontend dependencies
echo "--- Installing frontend dependencies ---"
if [ -d "core/frontend" ]; then
    (cd core/frontend && npm install)
else
    echo "Warning: 'core/frontend' directory not found. Skipping npm install."
fi

echo "--- Setup complete! ---"
echo "To activate the virtual environment, run: source venv/bin/activate"