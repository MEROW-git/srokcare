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

Accounts using the real backend can optionally protect sign-in with an authenticator app. Setup is in Settings and includes one-time recovery codes.

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

Open **[http://localhost:5173](http://localhost:5173)**. The example frontend configuration uses the real Spring Boot API. Keep `VITE_USE_MOCK_API=false` and set `VITE_API_BASE_URL=http://localhost:8080/api/v1` in `frontend/.env`. Demo data appears only when `VITE_USE_MOCK_API=true` is set explicitly.

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

## Real-Time Updates & WebSocket

FixKH uses Spring WebSocket with STOMP for live, instant updates across clients without page reloads.

- **WebSocket Endpoint:** `ws://localhost:8080/ws` (SockJS fallback: `http://localhost:8080/ws`)
- **Public Topics:**
  - `/topic/reports`: Broadcasts report creation, updates, deletions, moderator status transitions, comments, and support count updates across Cambodia.
  - `/topic/reports/{reportId}`: Broadcasts updates, comments, and support changes specific to an individual report.
- **Payload Privacy:** Broadcast payloads contain only minimal metadata (`eventType`, `reportId`, `timestamp`). No tokens, emails, OTPs, MFA secrets, or private user fields are ever broadcast.
- **Transactional Safety:** Events are broadcast exclusively after the database transaction successfully commits via Spring `@TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)`. Rolled back writes broadcast nothing.
- **Write Policy:** Clients may only subscribe to topics; writes are forbidden via WebSocket and must use the existing authenticated REST endpoints.
- **Offline & Reconnect:** Automatically reconnects upon network recovery and refetches affected REST data to catch up on updates missed while disconnected. Rapid event bursts are debounced to prevent duplicate refetches.

### Two-Browser Manual Test Procedure

To verify real-time updates between two users without refreshing:

1. **Setup Two Browser Windows:**
   - Open **Browser Window A** at `http://localhost:5173/feed` (e.g., standard Chrome window).
   - Open **Browser Window B** at `http://localhost:5173/feed` (e.g., incognito/private window or a second browser such as Firefox/Edge).

2. **Test 1: Report Creation & Feed / Map Sync:**
   - In **Browser Window A**, click **Report Issue** (`/create`) and submit a new civic issue report.
   - Watch **Browser Window B** (staying on `/feed`): the new report appears at the top of the feed immediately without refreshing.
   - In **Browser Window B**, switch to the **Map** tab (`/map`): verify the new pin appears on the map without refreshing.

3. **Test 2: Support Counter Sync:**
   - In **Browser Window A**, find any report on the feed and click the **Support** button.
   - Observe **Browser Window B**: the support counter for that card increments instantly.

4. **Test 3: Discussion Comments Sync:**
   - In both **Browser Window A** and **Browser Window B**, open the same report details page (`/reports/{id}`).
   - In **Browser Window A**, write a comment in the discussion box and submit.
   - Observe **Browser Window B**: the new comment appears in the discussion thread and the total comment counter updates in real time without refreshing.

5. **Test 4: Moderator Status Transition:**
   - In **Browser Window A**, navigate to the **Moderation Console** (`/admin`) and change the status of a report (e.g., from `Reported` to `In Progress` or `Resolved`).
   - Observe **Browser Window B** (viewing the report details or feed): the status badge and admin notes immediately update to reflect the new state.

6. **Test 5: Reconnect & Offline Reconciliation:**
   - In **Browser Window B**, temporarily disable network access in DevTools (Offline mode).
   - In **Browser Window A**, make a change (e.g., add a comment or update a report).
   - In **Browser Window B**, restore network access (Online): the client reconnects automatically and fetches the latest data without manual refresh.

## Development

| Directory | What it contains |
| :--- | :--- |
| [`backend/`](backend/README.md) | Spring Boot API, JWT authentication, PostgreSQL persistence, Flyway migrations, SMTP registration, and Gradle wrapper |
| [`frontend/`](frontend/README.md) | React, TypeScript, Vite, Tailwind CSS, MapLibre, and demo mode |

Run backend tests from `backend/` with `.\gradlew.bat test` (or `./gradlew test` on macOS/Linux). Run frontend checks from `frontend/` with `npm run lint` and `npm run build`.

FixKH is an independent community project. Submitting a report does not guarantee an official response.
