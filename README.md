# Employee Management System

A full-stack web application designed for managing employee information efficiently. The frontend is built with React and Vite, styled with Tailwind CSS, and the backend uses Node.js, Express, and MySQL.

## Table of Contents

-   [Overview](#overview)
-   [Features](#features)
-   [Tech Stack](#tech-stack)
-   [Prerequisites](#prerequisites)
-   [Getting Started](#getting-started)
    -   [Backend Setup](#backend-setup)
    -   [Frontend Setup](#frontend-setup)
-   [Running the Application](#running-the-application)
-   [Available Scripts](#available-scripts)
    -   [Backend](#backend)
    -   [Frontend](#frontend)
-   [Environment Variables](#environment-variables)
    -   [Backend (.env)](#backend-env)
    -   [Frontend (.env)](#frontend-env)
-   [Database Setup](#database-setup)
-   [License](#license)

## Overview

This project provides a user-friendly interface for administrators or Supervisors to perform CRUD (Create, Read, Update, Delete) operations on employee records. It likely includes features like viewing employee lists, adding new employees, editing details, and potentially viewing analytics or reports related to the workforce. Authentication is handled using JWT.

## Features

*(Based on typical employee management systems and included dependencies)*

-   **Employee Management:** Add, view, edit, and delete employee records.
-   **User Authentication:** Secure login/logout functionality using JWT (JSON Web Tokens) and password hashing (bcrypt).
-   **Data Visualization:** Potential dashboard with charts (using Chart.js) to display employee statistics.
-   **Responsive UI:** User interface built with React and Tailwind CSS for usability across different screen sizes.
-   **API Endpoints:** Robust backend API built with Express to handle data operations.
-   **File Uploads:** Capability to handle file uploads (e.g., profile pictures) using Multer.

## Tech Stack

**Frontend:**

-   **Framework/Library:** React 18
-   **Build Tool:** Vite
-   **Routing:** React Router v6
-   **State Management:** (Implicitly) React Context API or component state
-   **HTTP Client:** Axios
-   **Styling:** Tailwind CSS, Headless UI
-   **Charting:** Chart.js, react-chartjs-2
-   **Icons:** React Icons
-   **Utilities:** date-fns
-   **Linting:** ESLint

**Backend:**

-   **Runtime:** Node.js
-   **Framework:** Express
-   **Database:** MySQL (using mysql2 driver)
-   **Authentication:** JSON Web Token (jsonwebtoken), bcrypt
-   **Middleware:** CORS, Multer (for file uploads)
-   **Environment Variables:** dotenv
-   **Development:** Nodemon

## Prerequisites

Before you begin, ensure you have the following installed:

-   **Node.js:** (v18.x or later recommended)
-   **npm:** (Usually comes with Node.js) or **yarn**
-   **MySQL Server:** Running instance of MySQL database.

## Getting Started

Follow these steps to set up the project locally.

1.  **Clone the repository:**
    ```bash
    git clone <your-repository-url>
    cd <repository-folder-name>
    ```

### Backend Setup

1.  **Navigate to the backend directory:**
    ```bash
    cd backend
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    # or
    yarn install
    ```

3.  **Set up environment variables:**
    -   Create a `.env` file in the `backend` directory.
    -   Copy the contents of `.env.example` (if available) or add the required variables (see [Environment Variables](#backend-env)).
    -   Update the values for your local environment (database credentials, JWT secret, etc.).

4.  **Set up the database:**
    -   Ensure your MySQL server is running.
    -   Update the database credentials in your `.env` file.
    -   Run the database setup script (this likely creates tables and might seed initial data):
        ```bash
        npm run setup-db
        ```
        *(Review `database/setup.js` to understand exactly what this script does).*

### Frontend Setup

1.  **Navigate to the frontend directory:**
    ```bash
    # From the project root directory
    cd employee-management-frontend
    # or if you were in the backend directory
    # cd ../employee-management-frontend
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    # or
    yarn install
    ```

3.  **Set up environment variables (Optional but Recommended):**
    -   Create a `.env` file in the `employee-management-frontend` directory.
    -   Add the necessary environment variables, primarily the backend API URL (see [Environment Variables](#frontend-env)). Vite uses variables prefixed with `VITE_`.

## Running the Application

You need to run both the backend and frontend servers concurrently.

1.  **Start the Backend Server (Development Mode):**
    -   Open a terminal in the `backend` directory.
    -   Run:
        ```bash
        npm run dev
        ```
    -   The backend server will typically start on a port specified in your `.env` file (e.g., `http://localhost:5001`). Check the terminal output.

2.  **Start the Frontend Server (Development Mode):**
    -   Open another terminal in the `employee-management-frontend` directory.
    -   Run:
        ```bash
        npm run dev
        ```
    -   Vite will start the development server, usually on `http://localhost:5173`. Open this URL in your web browser.

## Available Scripts

### Backend (`backend/package.json`)

-   `npm run dev`: Starts the backend server in development mode using `nodemon` for automatic restarts on file changes.

### Frontend (`employee-management-frontend/package.json`)

-   `npm run dev`: Starts the Vite development server.

## Environment Variables

### Backend (.env)

Create a `.env` file in the `backend` directory with the following variables:

```env
# Server Configuration
PORT=5001 # Or any port you prefer for the backend

# Database Configuration
DB_HOST=localhost
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_NAME=employee_db # Or your database name

# JWT Configuration
JWT_SECRET=your_very_strong_jwt_secret_key # Replace with a strong, random secret
JWT_EXPIRES_IN=1d # Example: Token expiry time (e.g., 1d, 7d, 1h)

# Add any other backend-specific variables if needed