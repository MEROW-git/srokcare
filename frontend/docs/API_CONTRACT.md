# FixKH REST API Contract Specification
**Target Backend**: Java Spring Boot 3.x (Spring Security, Spring Data JPA, Jakarta Validation)  
**Target Consumer**: FixKH React Vite Frontend  
**Base Path**: `/api/v1`  
**Status**: Proposed Contract for Backend Implementation by Codex  

---

## 1. Architectural Overview & Conventions

### 1.1 Authentication & Pseudonymous Identity
- **JWT Bearer Token**: Returned upon login/register in `Authorization: Bearer <token>` header or response body.
- **Pseudonymity Principle**:
  - Registered users have an `id`, `nickname`, and `email`.
  - Only `nickname` is public. Real names and email addresses **MUST NEVER** be exposed in public endpoints (`/reports`, `/reports/{id}`, `/comments`).
  - Users are not strictly anonymous (they authenticate with email/password), but their public interaction identity is strictly their pseudonymous `nickname`.
- **User Roles**:
  - `ROLE_USER`: Standard citizen account. Can submit reports, toggle supports, post comments, update/delete own reports.
  - `ROLE_ADMIN`: Civic moderator account. Can change report statuses (`REPORTED`, `UNDER_REVIEW`, `IN_PROGRESS`, `RESOLVED`, `REJECTED`) and view platform analytics.

### 1.2 Data Formats & Dates
- **Content-Type**: `application/json` (except image uploads which use `multipart/form-data`).
- **Timestamps**: ISO 8601 UTC strings (e.g. `2026-10-12T14:30:00Z`).
- **Coordinates**: Standard WGS84 double precision floats (`latitude`, `longitude`).

### 1.3 Issue Categories (`ReportCategory`)
Enum values must exactly match:
```java
public enum ReportCategory {
    ROAD_DAMAGE,
    STREETLIGHT,
    GARBAGE,
    FLOODING,
    DRAINAGE,
    TRAFFIC_SAFETY,
    PUBLIC_FACILITY,
    OTHER
}
```

### 1.4 Issue Statuses (`ReportStatus`)
Enum values must exactly match:
```java
public enum ReportStatus {
    REPORTED,
    UNDER_REVIEW,
    IN_PROGRESS,
    RESOLVED,
    REJECTED
}
```

---

## 2. API Endpoints

### 2.1 Health & Diagnostics

#### `GET /api/v1/health`
Checks server and database availability.
- **Auth**: Public
- **Response 200 OK**:
```json
{
  "status": "UP",
  "timestamp": "2026-10-12T14:30:00Z"
}
```

---

### 2.2 Authentication

#### `POST /api/v1/auth/register`
Creates a new citizen account with a nickname.
- **Auth**: Public
- **Request Body**:
```json
{
  "nickname": "SOK Citizen",
  "email": "sok.citizen@example.com",
  "password": "strongPassword123"
}
```
- **Validation**:
  - `nickname`: Not blank, 2-50 chars (Khmer and UTF-8 characters permitted, duplicates permitted).
  - `email`: Valid email format, unique in database.
  - `password`: Minimum 6 chars.
- **Response 201 Created**:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "usr-8a21f6b8",
    "nickname": "SOK Citizen",
    "email": "sok.citizen@example.com",
    "role": "USER",
    "createdAt": "2026-10-12T14:30:00Z"
  }
}
```

#### `POST /api/v1/auth/login`
Authenticates user and returns JWT.
- **Auth**: Public
- **Request Body**:
```json
{
  "email": "sok.citizen@example.com",
  "password": "strongPassword123"
}
```
- **Response 200 OK**: Same format as Register.

#### `GET /api/v1/auth/me`
Retrieves authenticated user profile.
- **Auth**: Bearer JWT required
- **Response 200 OK**:
```json
{
  "id": "usr-8a21f6b8",
  "nickname": "SOK Citizen",
  "email": "sok.citizen@example.com",
  "role": "USER"
}
```

---

### 2.3 Community Reports

#### `GET /api/v1/reports`
Lists community reports with filtering and sorting.
- **Auth**: Public (if token is provided, `supportedByMe` is evaluated for the caller).
- **Query Parameters**:
  - `category` (optional): `ReportCategory` enum (e.g. `ROAD_DAMAGE`)
  - `status` (optional): `ReportStatus` enum (e.g. `REPORTED`)
  - `province` (optional): string (e.g. `Phnom Penh`)
  - `search` (optional): search query matched against title, description, district, address.
  - `sortBy` (optional): `latest` (default), `popular`, `most_supported`.
  - `page` (optional): integer (0-indexed, default 0).
  - `size` (optional): integer (default 20, max 100).
- **Response 200 OK**:
```json
[
  {
    "id": "rep-001",
    "title": "Large pothole near Tuol Tompoung intersection",
    "description": "Deep pothole causing motorcycle traffic hazard.",
    "category": "ROAD_DAMAGE",
    "status": "REPORTED",
    "authorNickname": "SOK Citizen",
    "authorId": "usr-8a21f6b8",
    "latitude": 11.5385,
    "longitude": 104.9142,
    "province": "Phnom Penh",
    "district": "Chamkarmon",
    "address": "Corner of St. 432 & St. 155",
    "images": [
      "https://storage.fixkh.local/images/rep-001-1.jpg"
    ],
    "supportCount": 34,
    "commentCount": 6,
    "supportedByMe": false,
    "createdAt": "2026-10-10T14:30:00Z",
    "updatedAt": "2026-10-10T14:30:00Z"
  }
]
```

#### `GET /api/v1/reports/{id}`
Retrieves a single report by ID.
- **Auth**: Public (evaluates `supportedByMe` if bearer token present).
- **Response 200 OK**: Single report object as defined above.
- **Response 404 Not Found**: `{ "error": "Report not found with id: {id}" }`

#### `POST /api/v1/reports`
Submits a new community issue report.
- **Auth**: Bearer JWT required (`ROLE_USER` or `ROLE_ADMIN`).
- **Request Body**:
```json
{
  "title": "Large pothole on the road",
  "description": "This road is dangerous for motorcycles during evening rain.",
  "category": "ROAD_DAMAGE",
  "latitude": 11.5564,
  "longitude": 104.9282,
  "province": "Phnom Penh",
  "district": "Daun Penh",
  "address": "Street 130 near Central Market",
  "images": [
    "https://storage.fixkh.local/images/sample.jpg"
  ]
}
```
- **Validation**:
  - `title`: 5-120 characters, not blank.
  - `description`: 15-2000 characters, not blank.
  - `category`: Valid `ReportCategory`.
  - `latitude`: Between 9.0 and 15.0 (Cambodia bounding box).
  - `longitude`: Between 102.0 and 108.0 (Cambodia bounding box).
  - `province`: Not blank.
  - `district`: Not blank.
- **Response 201 Created**: Complete `Report` object with status initialized to `REPORTED`, `supportCount: 0`, and `commentCount: 0`.

#### `PUT /api/v1/reports/{id}`
Updates an existing report created by the caller.
- **Auth**: Bearer JWT required (caller must own the report or have `ROLE_ADMIN`).
- **Request Body**:
```json
{
  "title": "Updated title",
  "description": "Updated description with more details",
  "category": "ROAD_DAMAGE",
  "address": "Corner of St. 155"
}
```
- **Response 200 OK**: Updated `Report` object.

#### `DELETE /api/v1/reports/{id}`
Deletes a report created by the caller.
- **Auth**: Bearer JWT required (caller must own the report or have `ROLE_ADMIN`).
- **Response 204 No Content**

#### `GET /api/v1/reports/my`
Retrieves reports submitted by the authenticated user.
- **Auth**: Bearer JWT required.
- **Response 200 OK**: List of reports owned by the caller.

---

### 2.4 Image Uploads

#### `POST /api/v1/reports/{id}/images`
Uploads 1 to 5 images for a report.
- **Auth**: Bearer JWT required (caller must own the report).
- **Content-Type**: `multipart/form-data`
- **Form Field**: `files` (Array of files, JPEG/PNG/WebP, max 5MB each).
- **Response 200 OK**:
```json
[
  {
    "id": "img-001",
    "url": "https://storage.fixkh.local/images/img-001.jpg",
    "createdAt": "2026-10-12T14:30:00Z"
  }
]
```

---

### 2.5 Community Supports (Upvotes)

#### `POST /api/v1/reports/{id}/support`
Adds a support upvote from the authenticated user.
- **Auth**: Bearer JWT required.
- **Response 200 OK**:
```json
{
  "supportCount": 35,
  "supportedByMe": true
}
```

#### `DELETE /api/v1/reports/{id}/support`
Removes support upvote from the authenticated user.
- **Auth**: Bearer JWT required.
- **Response 200 OK**:
```json
{
  "supportCount": 34,
  "supportedByMe": false
}
```

---

### 2.6 Comments

#### `GET /api/v1/reports/{id}/comments`
Retrieves comments for a report, ordered chronologically.
- **Auth**: Public.
- **Response 200 OK**:
```json
[
  {
    "id": "cmt-001",
    "reportId": "rep-001",
    "authorNickname": "Chan_Motorbike",
    "authorId": "usr-101",
    "content": "Neighbors put a temporary warning branch here.",
    "createdAt": "2026-10-10T16:15:00Z"
  }
]
```

#### `POST /api/v1/reports/{id}/comments`
Adds a comment under a report.
- **Auth**: Bearer JWT required.
- **Request Body**:
```json
{
  "content": "The road crew arrived this morning to inspect the damage."
}
```
- **Response 201 Created**: Complete `Comment` object with `authorNickname` set to the caller's nickname.

#### `DELETE /api/v1/comments/{id}`
Deletes a comment.
- **Auth**: Bearer JWT required (owner of comment or `ROLE_ADMIN`).
- **Response 204 No Content**

---

### 2.7 Civic Moderation (Admin)

#### `GET /api/v1/admin/reports`
Moderation list with full filters.
- **Auth**: Bearer JWT required with `ROLE_ADMIN`.
- **Response 200 OK**: List of reports.

#### `PATCH /api/v1/admin/reports/{id}/status`
Updates official progress status of a community issue.
- **Auth**: Bearer JWT required with `ROLE_ADMIN`.
- **Request Body**:
```json
{
  "status": "IN_PROGRESS",
  "adminNote": "Inspection dispatched to municipal public works department."
}
```
- **Response 200 OK**: Updated `Report` object.

#### `GET /api/v1/admin/stats`
Platform metrics summary.
- **Auth**: Bearer JWT required with `ROLE_ADMIN`.
- **Response 200 OK**:
```json
{
  "totalReports": 48,
  "reported": 14,
  "underReview": 10,
  "inProgress": 12,
  "resolved": 10,
  "rejected": 2,
  "totalSupports": 420,
  "totalComments": 85
}
```

---

## 3. Error Responses
Standard RFC 7807 problem details or structured error:
```json
{
  "timestamp": "2026-10-12T14:30:00Z",
  "status": 400,
  "error": "Bad Request",
  "message": "Title must be between 5 and 120 characters",
  "path": "/api/v1/reports"
}
```
Common HTTP status codes:
- `400 Bad Request`: Validation failure.
- `401 Unauthorized`: Missing or expired JWT token.
- `403 Forbidden`: Insufficient role or attempting to modify another user's report.
- `404 Not Found`: Report or comment ID not found.
- `409 Conflict`: Email already in use upon registration.
