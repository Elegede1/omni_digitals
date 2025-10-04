# Full-Stack Application with React and Django

This repository contains a full-stack application with a React frontend and a Django backend. The application is designed for production deployment, with the frontend hosted on Vercel and the backend on Render. It includes Google OAuth 2.0 for user authentication.

## Directory Structure

-   `/frontend`: Contains the React application built with Vite.
-   `/backend`: Contains the Django application.

---

## Backend Deployment (Render)

The backend is a Django application designed to be deployed as a Web Service on Render.

### 1. Create a New Web Service on Render

-   From your Render dashboard, click **New +** and select **Web Service**.
-   Connect your GitHub repository.

### 2. Configure the Service

-   **Environment**: `Python 3`
-   **Root Directory**: `backend` (if you are deploying the backend as a separate service)
-   **Build Command**: `bash build.sh`
-   **Start Command**: `gunicorn core.wsgi`
-   **Instance Type**: Choose a suitable instance type (e.g., "Free" or "Starter").

### 3. Add Environment Variables

You need to configure the following environment variables in the Render dashboard under the **Environment** tab:

-   `SECRET_KEY`: A strong, randomly generated secret key for Django. You can generate one using an online tool or Python's `secrets` library.
-   `GOOGLE_CLIENT_ID`: Your Google OAuth 2.0 Client ID (see Google OAuth setup below).
-   `GOOGLE_CLIENT_SECRET`: Your Google OAuth 2.0 Client Secret.
-   `DATABASE_URL`: If you are using Render's PostgreSQL database, create a new database and Render will provide you with the `DATABASE_URL`. You will also need to install `dj-database-url` and `psycopg2-binary` and configure it in `settings.py`.
-   `DEBUG`: Set to `False` for production.

### 4. Deploy

Click **Create Web Service** to deploy your backend.

---

## Frontend Deployment (Vercel)

The frontend is a React application built with Vite.

### 1. Create a New Project on Vercel

-   From your Vercel dashboard, click **Add New...** and select **Project**.
-   Import your GitHub repository.

### 2. Configure the Project

-   **Framework Preset**: Vercel should automatically detect that this is a Vite project.
-   **Root Directory**: Set the root directory to `frontend`.
-   **Build and Output Settings**: These should be automatically configured by Vercel.

### 3. Deploy

Click **Deploy** to launch your frontend.

**Note**: The backend URL is currently hardcoded in the frontend components (`SignIn.tsx` and `SignUp.tsx`). For a more flexible setup, you should use an environment variable (e.g., `VITE_API_URL`) and reference it in your code.

---

## Google OAuth 2.0 Setup

To enable Google login, you need to create a project in the Google Cloud Console and configure OAuth 2.0 credentials.

### 1. Create a Google Cloud Project

-   Go to the [Google Cloud Console](https://console.cloud.google.com/).
-   Create a new project.

### 2. Enable APIs and Services

-   In your project dashboard, go to **APIs & Services** > **Enabled APIs & services**.
-   Click **+ ENABLE APIS AND SERVICES** and search for the **Google People API**. Enable it.

### 3. Create OAuth 2.0 Credentials

-   Go to **APIs & Services** > **Credentials**.
-   Click **+ CREATE CREDENTIALS** and select **OAuth client ID**.
-   **Application type**: Select **Web application**.
-   **Name**: Give your client ID a name (e.g., "Web client 1").

### 4. Configure Authorized URIs

-   **Authorized JavaScript origins**: Add the URL of your Vercel frontend (e.g., `https://your-frontend-app.vercel.app`).
-   **Authorized redirect URIs**: Add the URL of your Render backend's Google login callback endpoint. This will be `https://your-backend-app.onrender.com/accounts/google/login/callback/`.

### 5. Get Your Client ID and Secret

-   After creating the client ID, you will see your **Client ID** and **Client Secret**.
-   Copy these values and add them as environment variables in your Render backend service as `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`.

With these steps completed, your full-stack application should be successfully deployed and configured for production.