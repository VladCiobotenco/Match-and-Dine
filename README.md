# Match-and-Dine

This document provides instructions for setting up and running the Match-and-Dine project.

## Prerequisites

Before you begin, ensure you have the following installed on your system:
- [Python 3.8+](https://www.python.org/downloads/)
- [Node.js and npm](https://nodejs.org/en/download/) (LTS version is recommended)

## Project Setup

To get the project dependencies installed and ready for development, run the setup script appropriate for your operating system from the project root.

### For Windows Users

Open a Command Prompt or PowerShell and run:
```shell
setup.bat
```

### For macOS and Linux Users

Open your terminal, make the script executable, and then run it:
```shell
chmod +x setup.sh
./setup.sh
```

These scripts will perform the following actions:
1.  Create a Python virtual environment in a `venv` directory.
2.  Install the required Python packages from `requirements.txt`.
3.  Install the frontend Node.js dependencies from `core/frontend/package.json`.

## Running the Application

After the setup is complete, you must activate the virtual environment before running the application.

1.  **Activate the virtual environment:**
    -   On Windows: `venv\Scripts\activate`
    -   On macOS/Linux: `source venv/bin/activate`

2.  **Run the Django development server:**
    ```shell
    python core/manage.py runserver
    ```
    The backend API will be available at `http://127.0.0.1:8000/`.

3.  **Run the frontend development server:**
    In a **new terminal**, navigate to the frontend directory and start its development server.
    ```shell
    cd core/frontend
    npm run dev
    ```
    The frontend will be accessible in your browser (check the terminal output for the exact URL, usually `http://localhost:3000`).
