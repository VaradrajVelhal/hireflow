# 🚀 HireFlow – AI-Powered Job Application Management Platform

> A modern full-stack platform that helps job seekers organize applications, analyze resume compatibility using AI, identify skill gaps, and prepare for interviews.

![React](https://img.shields.io/badge/React-19-blue?logo=react)
![Django](https://img.shields.io/badge/Django-6-green?logo=django)
![DRF](https://img.shields.io/badge/Django%20REST%20Framework-red)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-17-blue?logo=postgresql)
![Docker](https://img.shields.io/badge/Docker-Enabled-2496ED?logo=docker)
![JWT](https://img.shields.io/badge/Auth-JWT-orange)
![Gemini AI](https://img.shields.io/badge/AI-Google%20Gemini-blueviolet)

---

## 📖 Overview

Hiring today is competitive, and managing dozens of job applications manually can quickly become overwhelming.

HireFlow simplifies the job search process by allowing users to:

- Browse and search job listings
- Track applications in one place
- Upload and manage resumes
- Analyze resume compatibility with AI
- Identify missing skills
- Receive resume improvement suggestions
- Discover interview preparation topics

Instead of manually comparing resumes with job descriptions, HireFlow uses **Google Gemini AI** to generate intelligent insights that help candidates improve their chances.

---

# ✨ Features

## 🔐 Authentication

- JWT Authentication
- User Registration
- Secure Login
- Protected Routes
- Token Refresh

---

## 💼 Job Management

- Browse jobs
- Search by keyword
- Filter by location
- Pagination
- Job details
- Track applications
- External application support

---

## 📄 Resume Management

- Upload PDF resume
- Replace existing resume
- Delete resume
- Automatic resume text extraction
- AI-ready status indicator
- Resume metadata display

---

## 🤖 AI Resume Analysis

After uploading a resume, Google Gemini extracts structured information including:

- Skills
- Technologies
- Projects
- Domains
- Education
- Experience Level
- Strengths

The extracted information is stored for future AI analysis.

---

## 🎯 AI Resume Match

Users can compare their resume against any job description.

The AI generates:

- Match Score
- Score Explanation
- Matching Skills
- Missing Skills
- Resume Improvement Suggestions
- Interview Preparation Topics
- Strengths
- Weaknesses

---

## 📊 Application Tracking

- Save jobs
- Track application progress
- Maintain application history
- Dashboard overview

---

## 🎨 User Experience

- Modern responsive UI
- Dark theme
- Confirmation dialogs
- Loading states
- Error handling
- Skeleton loaders
- Empty states
- Responsive design

---

# 🛠 Tech Stack

## Frontend

- React
- Vite
- Tailwind CSS
- Axios
- React Router

---

## Backend

- Django
- Django REST Framework
- Simple JWT
- PostgreSQL
- PyMuPDF
- Google Gemini API

---

## DevOps

- Docker
- Docker Compose
- Gunicorn

---

# 🏗 Architecture

```
                 +----------------------+
                 |     React Frontend   |
                 +----------+-----------+
                            |
                         Axios API
                            |
                            ▼
               +-------------------------+
               | Django REST Framework   |
               +-----------+-------------+
                           |
        +------------------+------------------+
        |                  |                  |
        ▼                  ▼                  ▼
 Authentication      Resume Module      Job Module
        |                  |                  |
        ▼                  ▼                  ▼
    PostgreSQL      Gemini AI Service    Applications
```

---

# 📁 Project Structure

```
HireFlow/
│
├── backend/
│   ├── config/
│   ├── users/
│   ├── jobs/
│   ├── applications/
│   ├── profiles/
│   │      ├── services/
│   │      │      ├── ai_resume_service.py
│   │      │      └── ai_match_service.py
│   │      ├── serializers.py
│   │      ├── views.py
│   │      └── models.py
│   │
│   └── requirements.txt
│
├── frontend/
│   ├── src/
│   ├── components/
│   ├── pages/
│   ├── hooks/
│   ├── services/
│   └── context/
│
├── docker-compose.dev.yml
├── Dockerfile
└── README.md
```

---

# 🤖 AI Workflow

## Resume Upload

```
Upload PDF
      │
      ▼
Store Resume
      │
      ▼
Extract Text (PyMuPDF)
      │
      ▼
Google Gemini
      │
      ▼
Extract Skills & Metadata
      │
      ▼
Store JSON
```

---

## Resume Match

```
Resume Text
        +
Job Description
        │
        ▼
Google Gemini
        │
        ▼
Generate

✔ Match Score
✔ Missing Skills
✔ Strengths
✔ Weaknesses
✔ Suggestions
✔ Interview Topics
```

---

# 📦 Installation

## Clone Repository

```bash
git clone https://github.com/VaradrajVelhal/HireFlow.git

cd HireFlow
```

---

## Backend

```bash
cd backend

python -m venv venv

source venv/bin/activate
```

Windows

```bash
venv\Scripts\activate
```

Install dependencies

```bash
pip install -r requirements.txt
```

Run migrations

```bash
python manage.py migrate
```

Run server

```bash
python manage.py runserver
```

---

## Frontend

```bash
cd frontend

npm install

npm run dev
```

---

# 🐳 Docker

Start development environment

```bash
docker compose -f docker-compose.dev.yml up --build
```

---

# 🔑 Environment Variables

Create a `.env` file inside the backend directory.

```env
SECRET_KEY=your_secret_key

DEBUG=True

DATABASE_URL=postgresql://username:password@host/database

GEMINI_API_KEY=your_gemini_api_key
```

Frontend

```env
VITE_API_URL=http://localhost:8000/api
```

---

# 🚀 Future Improvements

- Email notifications
- Application analytics
- AI cover letter generator
- Resume version history
- Interview scheduling
- Company insights
- Saved searches
- Multi-language resume support

---

# 🧪 Testing

Run backend tests

```bash
python manage.py test
```

---

# 🔒 Security

- JWT Authentication
- Password hashing
- Protected APIs
- File validation
- Secure file uploads
- Environment variables
- CORS configuration

---

# 📈 Highlights

- Full Stack Application
- AI Integration using Google Gemini
- RESTful API Architecture
- JWT Authentication
- PostgreSQL Database
- Dockerized Development
- Resume Parsing
- AI Resume Matching
- Modern Responsive UI

---

# 👨‍💻 Author

**Varadraj Velhal**

MCA Student | Full Stack Developer

- LinkedIn: https://www.linkedin.com/in/varadrajvelhal/
- GitHub: https://github.com/VaradrajVelhal

---

# 📄 License

This project is developed for educational and portfolio purposes.