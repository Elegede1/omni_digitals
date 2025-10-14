# OmniDigitals - Full-Stack Web Application

Welcome to OmniDigitals! This is a modern, full-stack web application built with a React frontend and a Django backend. The project is designed to be scalable, secure, and easily deployable, featuring user authentication via Google OAuth 2.0.

## ✨ Key Features

-   **Modern Frontend**: A responsive and dynamic user interface built with React, Vite, and Tailwind CSS.
-   **Robust Backend**: A powerful and secure API powered by Django and Django REST Framework.
-   **Social Authentication**: Seamless user login and registration using Google OAuth 2.0, managed by `django-allauth`.
-   **Production-Ready**: Pre-configured for deployment with Vercel for the frontend and Render for the backend.
-   **Clean Codebase**: A well-organized project structure separating frontend and backend concerns.

---

## 🛠️ Tech Stack

-   **Frontend**: React, Vite, TypeScript, Tailwind CSS, shadcn/ui
-   **Backend**: Python, Django, Django REST Framework
-   **Database**: PostgreSQL (for production), SQLite (for development)
-   **Authentication**: `django-allauth` (Google OAuth 2.0)
-   **Deployment**: Vercel (Frontend), Render (Backend)

---

## 🚀 Getting Started

To get a local copy up and running, follow these simple steps.

### Prerequisites

-   Node.js and npm
-   Python and pip
-   A virtual environment tool for Python (e.g., `venv`)

### Backend Setup

1.  Navigate to the `backend` directory:
    ```sh
    cd backend
    ```
2.  Create and activate a virtual environment:
    ```sh
    python -m venv venv
    source venv/bin/activate  # On Windows, use `venv\Scripts\activate`
    ```
3.  Install the required packages:
    ```sh
    pip install -r requirements.txt
    ```
4.  Run database migrations:
    ```sh
    python manage.py migrate
    ```
5.  Start the development server:
    ```sh
    python manage.py runserver
    ```
    The backend will be running at `http://127.0.0.1:8000`.

### Frontend Setup

1.  Navigate to the `frontend` directory:
    ```sh
    cd frontend
    ```
2.  Install the required packages:
    ```sh
    npm install
    ```
3.  Create a local environment file `.env.local` and add the backend URL:
    ```
    VITE_API_URL=http://127.0.0.1:8000
    ```
4.  Start the development server:
    ```sh
    npm run dev
    ```
    The frontend will be running at `http://localhost:8080`.

---

## 🤝 Contributing

Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1.  Fork the Project
2.  Create your Feature Branch (`git checkout -b feat/AmazingFeature`)
3.  Commit your Changes (`git commit -m 'feat: Add some AmazingFeature'`)
4.  Push to the Branch (`git push origin feat/AmazingFeature`)
5.  Open a Pull Request

## 💡 Future Enhancements

Here are some ideas for how this project could be extended:

-   **User Profile Management**: Allow users to view and edit their profile information.
-   **Expanded Social Logins**: Add support for other OAuth providers like GitHub or Facebook.
-   **API Rate Limiting**: Implement rate limiting on the Django backend to prevent abuse.
-   **Advanced State Management**: Integrate a state management library like Redux Toolkit or Zustand for the frontend.
-   **Comprehensive Test Suite**: Add unit and integration tests for both the frontend and backend to ensure code quality and reliability.