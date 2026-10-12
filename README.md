<div align="center">

# FixKH

### Report. Support. Improve.

Community reporting for roads, drainage, waste, lighting, and other local issues across Cambodia.

![Java 21](https://img.shields.io/badge/Java-21-ED8B00?logo=openjdk&logoColor=white)
![Spring Boot 3.5](https://img.shields.io/badge/Spring_Boot-3.5-6DB33F?logo=springboot&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?logo=postgresql&logoColor=white)
![React 19](https://img.shields.io/badge/React-19-149ECA?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-6-3178C6?logo=typescript&logoColor=white)

[Features](#features) · [Quick start](#quick-start) · [Email verification](#email-verification) · [API docs](#api-docs) · [Development](#development)

</div>

---

> FixKH helps neighbors document public problems, find them on a map, and follow community updates. Reports use public nicknames; account email addresses stay private. A report's status describes moderation on this platform, not acceptance or resolution by a government agency.

## Features

| Explore | Participate | Moderate |
| :--- | :--- | :--- |
| Browse a searchable feed with category and status filters | Submit a report with a location and photos | Review reports in an admin dashboard |
| Find reports on an interactive Cambodia map | Support reports and join the discussion | Update report statuses |
| Open a report to see details and its location | Track your own reports under a public nickname | Use a development-only admin account for local testing |

The interface supports English and Khmer. The frontend also has a browser-based demo mode with sample reports, so you can explore the UI before connecting a database.

## Quick start

**Requirements:** Java 21, Node.js 20+, npm 10+, and PostgreSQL 16 (or Docker for a local database). Use the included Gradle wrapper; a separate Gradle installation is unnecessary.

### 1. Configure the backend

From the repository root in PowerShell:

```powershell
cd backend
if (!(Test-Path .env)) { Copy-Item .env.example .env }
```

Edit `backend/.env`. Set `DB_PASSWORD` and a random `JWT_SECRET` of at least 32 characters. The app reads this file automatically. Keep real passwords and keys in `.env`, never in `.env.example` or a commit.

For the included local PostgreSQL container, start Docker Desktop and run:

```powershell
docker compose up -d
.\gradlew.bat bootRun
```

If you already have a hosted PostgreSQL database, set `DB_URL` in `backend/.env` and run only `.\gradlew.bat bootRun`. The backend applies Flyway migrations on startup. On macOS/Linux, use `./gradlew bootRun`.

### 2. Start the frontend

In another terminal, from the repository root:

```powershell
cd frontend
if (!(Test-Path .env)) { Copy-Item .env.example .env }
npm install
npm run dev
```

Open **[http://localhost:5173](http://localhost:5173)**. The example frontend configuration starts in demo mode with sample data. To send requests to Spring Boot, set `VITE_USE_MOCK_API=false` and `VITE_API_BASE_URL=http://localhost:8080/api/v1` in `frontend/.env`, then restart Vite.

> **Live API status:** Registration and login use the backend in real API mode. Some report interactions still need frontend contract updates, including support removal and separate multipart image upload. See the [backend integration notes](backend/README.md#react-integration) before testing the full live flow.

## Email verification

Real API registration sends a six-digit code **only when someone registers**. The user enters that code to finish creating an account. Codes expire after 10 minutes and have request and attempt limits.

Set `otp_email` to a verified **sender address** in `backend/.env`. Configure `SMTP_HOST`, `SMTP_PORT`, `SMTP_USERNAME`, and `SMTP_PASSWORD` with credentials from your email provider. The [backend setup guide](backend/README.md#start-locally) includes a Brevo SMTP example. Without working SMTP settings, registration returns `503`; demo mode does not send email.

## API docs

With the backend running on its default port:

| Resource | URL |
| :--- | :--- |
| Swagger UI | [http://localhost:8080/swagger-ui/index.html](http://localhost:8080/swagger-ui/index.html) |
| OpenAPI JSON | [http://localhost:8080/v3/api-docs](http://localhost:8080/v3/api-docs) |
| Health check | [http://localhost:8080/api/v1/health](http://localhost:8080/api/v1/health) |

For request bodies and response examples, see the [backend API examples](backend/docs/API_EXAMPLES.md). The [frontend API contract](frontend/docs/API_CONTRACT.md) describes the client-side expectations.

## Development

| Directory | What it contains |
| :--- | :--- |
| [`backend/`](backend/README.md) | Spring Boot API, JWT authentication, PostgreSQL persistence, Flyway migrations, SMTP registration, and Gradle wrapper |
| [`frontend/`](frontend/README.md) | React, TypeScript, Vite, Tailwind CSS, MapLibre, and demo mode |

Run backend tests from `backend/` with `.\gradlew.bat test` (or `./gradlew test` on macOS/Linux). Run frontend checks from `frontend/` with `npm run lint` and `npm run build`.

FixKH is an independent community project. Submitting a report does not guarantee an official response.
