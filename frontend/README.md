# FixKH — Cambodian Civic Issue Reporting Platform (Frontend)

> **Report. Support. Improve.**  
> *រាយការណ៍. គាំទ្រ. កែលម្អ.*

FixKH is a modern, crowdsourced civic issue reporting platform tailored for Cambodia. Inspired by modern community discussion platforms, FixKH allows citizens to document public infrastructure problems—such as broken roads, malfunctioning streetlights, uncollected waste, street flooding, and clogged drainage—using pseudonymous nicknames and interactive maps.

---

## 🚀 Quick Start

### 1. Prerequisites
- **Node.js**: v20 or higher
- **npm**: v10 or higher

### 2. Installation
Navigate to the `frontend` directory:
```bash
cd frontend
npm install
```

### 3. Start Development Server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

The example environment uses demo data. To use registration email and optional authenticator app MFA, set `VITE_USE_MOCK_API=false` and `VITE_API_BASE_URL=http://localhost:8080/api/v1` in `frontend/.env`, then restart the development server. After signing in, open Settings to scan an authenticator QR code and save the one-time recovery codes.

The feed map, report location picker, and report detail map use [OpenFreeMap](https://openfreemap.org/quick_start/) for the default Road view. It needs no API key and stays light even when the site is in dark mode. To enable the optional Satellite toggle, set `VITE_MAPTILER_API_KEY` in your local `frontend/.env` and restart the development server. Satellite imagery comes from MapTiler, with its required logo and map attribution. The MapTiler key is visible in browser requests, so restrict its allowed origins in MapTiler Cloud. [MapTiler's Free plan](https://www.maptiler.com/cloud/pricing/) is for non-commercial use and pauses at its usage limit.

### 4. Build for Production
```bash
npm run build
```

---

## 🛠️ Technology Stack

- **Framework**: React 19 + Vite 8 + TypeScript
- **Styling**: Tailwind CSS v4 + Custom design tokens
- **Routing**: React Router v7 (`react-router-dom`)
- **Map Engine**: MapLibre GL JS + OpenFreeMap
- **State & Data Fetching**: TanStack Query (`@tanstack/react-query`) + Axios
- **Form Management & Validation**: React Hook Form + Zod
- **Icons**: Lucide React
- **Toast Notifications**: Sonner
- **Internationalization (i18n)**: Native bilingual context supporting **English** and **Khmer (ភាសាខ្មែរ)**

---

## 🌟 Application Features & Pages

| Route | Page | Description |
|---|---|---|
| `/` | **Landing Page** | Hero section, How It Works (Spot & Document, Community Voice, Track Resolution), categories grid, recent reports preview, platform benefits, and civic disclaimer. |
| `/feed` | **Community Feed** | 3-column Reddit/social-style feed with search, category chips, status filters, sorting (Latest, Popular, Most Supported), live report cards with support & comment counters. |
| `/map` | **Explore Map** | Fullscreen MapLibre GL map centered on Cambodia with category-colored markers, interactive report preview cards, and filtering by province/status/category. |
| `/reports/new` | **Create Report** | Submission form with photo upload (up to 5 images with previews), interactive location picker with drag-to-pin and GPS geolocation, validated via Zod. |
| `/reports/:id` | **Report Details** | Full issue view, image viewer, mini-map of exact coordinates, live support upvote toggle, and community discussion comments. |
| `/register` | **Registration** | Pseudonymous account creation using public nicknames (e.g. `SOK Citizen` or `សុខ ពលរដ្ឋ`). Never requests real names; email remains private. |
| `/login` | **Login** | Authentication with password toggle and instant one-click demo shortcuts (`SOK Citizen` and `Admin Moderator`). |
| `/my-reports` | **My Reports** | Manage submitted reports, filter by status, quick inline editing modal, and safe deletion with confirmation dialog. |
| `/settings` | **User Settings** | Update public nickname, inspect public identity preview, toggle language (Khmer/English), view privacy disclosures. |
| `/admin` | **Admin Dashboard** | Dedicated moderation console with metric cards, moderation queue table, and status transition selector (`REPORTED` → `UNDER_REVIEW` → `IN_PROGRESS` → `RESOLVED` / `REJECTED`). |

---

## 🔄 Mock API vs Real Spring Boot Backend

The frontend is architected with a decoupled service layer (`src/services/`):

- In **Mock Mode** (`VITE_USE_MOCK_API=true`), all CRUD operations, upvotes, comments, and status transitions persist automatically to browser `localStorage` using 16+ realistic Cambodian community sample reports.
- In **Real Backend Mode** (`VITE_USE_MOCK_API=false`), requests are dispatched via Axios to the Java Spring Boot backend at `http://localhost:8080/api/v1`.

### Environment Configuration (`.env`)
```env
VITE_API_BASE_URL=http://localhost:8080/api/v1
VITE_USE_MOCK_API=true
```

For full details on expected Spring Boot REST endpoints, schemas, authentication, and multipart upload formats, please review:
👉 **[`frontend/docs/API_CONTRACT.md`](./docs/API_CONTRACT.md)**

---

## 🛡️ Civic & Privacy Notice

FixKH is an independent civic platform designed for community coordination. It does not claim to be an official government service, and submitting a report does not guarantee official intervention. Users are protected through pseudonymous nicknames, keeping email addresses private.
