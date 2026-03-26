@echo off
setlocal

echo --- Starting project setup ---

REM 1. Check for Python
python --version >nul 2>nul
if %errorlevel% neq 0 (
    echo Python could not be found. Please install Python and ensure it's in your PATH.
    exit /b 1
)

REM 2. Create a virtual environment
echo --- Creating Python virtual environment in 'venv' ---
python -m venv venv

REM 3. Install Python dependencies
echo --- Installing Python dependencies from requirements.txt ---
call venv\Scripts\pip.exe install -r requirements.txt

REM 4. Check for Node.js and npm
npm --version >nul 2>nul
if %errorlevel% neq 0 (
    echo npm could not be found. Please install Node.js and ensure it's in your PATH.
    exit /b 1
)

REM 5. Install frontend dependencies
if exist "core\frontend\package.json" (
    echo --- Installing frontend dependencies ---
    pushd core\frontend
    call npm install
    popd
) else (
    echo Warning: 'core\frontend\package.json' not found. Skipping npm install.
)

echo --- Setup complete! ---
echo To activate the virtual environment, run: venv\Scripts\activate.bat
endlocal