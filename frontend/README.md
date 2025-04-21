# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript and enable type-aware lint rules. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.


## For Project Implementation:
## EMS Project Setup Guide

This document provides instructions for setting up and running the Employee Management System (EMS) project.

## Prerequisites

- Node.js and npm installed
- SQL database server (MySQL/PostgreSQL) installed and running
- Git (optional, for cloning the repository)

## Initial Setup

Before starting the application, run the SQL file to set up your database schema and initial data:

```
# Navigate to your SQL file location and execute it using your database tool
# Example for MySQL:
mysql -u username -p database_name < setup.sql
```

## Backend Setup

1. Navigate to the backend directory:
   ```
   cd backend
   ```

2. Install dependencies:
   ```
   npm i
   ```

3. Configure your database connection:
   - Create or edit the `.env` file in the backend directory
   - Add your database password (without quotes)
   ```
   DB_PASSWORD=your_password_here
   ```

4. Start the backend server:
   ```
   npm run dev
   ```

5. The backend server should now be running on the configured port (typically http://localhost:5000)

## Frontend Setup

1. Open a new terminal window and navigate to the frontend directory:
   ```
   cd frontend
   ```

2. Install dependencies:
   ```
   npm i
   ```

3. Start the frontend development server:
   ```
   npm run dev
   ```

4. The frontend application should now be running (typically at http://localhost:3000)

## Accessing the Application

Once both backend and frontend servers are running, you can access the application by opening your web browser and navigating to the frontend URL (typically http://localhost:3000).

## Troubleshooting

- If you encounter any database connection issues, verify that:
  - Your database server is running
  - The credentials in your `.env` file are correct
  - The database referenced in your connection string exists

- For any dependency-related errors, try removing the `node_modules` folder and running `npm i` again