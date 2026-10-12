# FixKH API

Java 21 and Spring Boot 3.5 REST API for pseudonymous community issue reports in Cambodia. Data is stored in PostgreSQL. Reports are community submissions; a report status is a platform moderation state and does not by itself mean a government agency accepted or resolved the issue.

## Structure

`controller` handles HTTP and validation; `service` holds business rules; `repository` handles database access; `entity` maps PostgreSQL tables; `dto` defines request and response JSON; `mapper` builds safe public responses; `security` handles the current JWT identity; `storage` isolates processed image storage; `exception` handles consistent errors; `config` holds security, OpenAPI and development admin setup. `src/main/resources/db/migration` contains the Flyway schema.

## Start locally

Install Java 21. Gradle is downloaded by the included wrapper. The application reads `backend/.env` automatically. For a local PostgreSQL container, install Docker Desktop with its engine running. From `backend` in PowerShell:

```powershell
if (!(Test-Path .env)) { Copy-Item .env.example .env }
# If you created .env, replace the DB_PASSWORD and JWT_SECRET placeholders.
docker compose up -d
.\gradlew.bat bootRun
```

Check `java -version` first. If it shows an older JDK, set `JAVA_HOME` to your Java 21 installation before running the wrapper. If port 8080 is already in use, run `$env:SERVER_PORT=18080` before `bootRun` and use port 18080 in the URLs below.

With a hosted PostgreSQL database, set `DB_URL=postgresql://username:password@host/database?sslmode=require` in `.env` and run the Gradle command without Docker. A JDBC URL with separate `DB_USERNAME` and `DB_PASSWORD` also works. Environment variables override `.env`. `DB_NAME` is unused because the database name comes from `DB_URL`. Flyway and JPA use their own `fixkh` schema by default (`DB_SCHEMA` can change it), leaving unrelated tables in `public` alone. Set `CORS_ALLOWED_ORIGINS`, `UPLOAD_DIR`, or `PUBLIC_BASE_URL` as needed. For local Docker, PostgreSQL starts on localhost port 5432 with database `fixkh`. On macOS/Linux, use `./gradlew bootRun`.

Check `http://localhost:8080/api/v1/health`. Swagger UI is at `http://localhost:8080/swagger-ui/index.html`; OpenAPI JSON is at `http://localhost:8080/v3/api-docs`. Flyway migrates the schema on startup and Hibernate validates it.

To create a **development-only** administrator, set `SPRING_PROFILES_ACTIVE=dev`, `FIXKH_DEV_ADMIN_EMAIL`, `FIXKH_DEV_ADMIN_PASSWORD` (at least 12 characters), and optionally `FIXKH_DEV_ADMIN_NICKNAME` before startup. Bootstrap creates the account only if the email is unused. Never enable the dev profile or bootstrap credentials in production. Public registration always creates `CITIZEN`.

## Try the API

Register:

```bash
curl -X POST http://localhost:8080/api/v1/auth/register -H 'Content-Type: application/json' -d '{"nickname":"SOK Citizen","email":"sok@example.com","password":"StrongPassword123!"}'
```

Log in with `POST /api/v1/auth/login` using `{"email":"sok@example.com","password":"StrongPassword123!"}`. Copy the returned `token` into Swagger's **Authorize** dialog, then create a report with `POST /api/v1/reports` and the body below. Swagger sends `Authorization: Bearer <token>` automatically.

```json
{
  "title": "Large pothole on the road",
  "description": "This road is dangerous for motorcycles.",
  "category": "ROAD_DAMAGE",
  "latitude": 11.5564,
  "longitude": 104.9282,
  "province": "Phnom Penh",
  "district": "Daun Penh"
}
```

The new report starts at `REPORTED`. Use `POST /api/v1/reports/{id}/images` with multipart field `files` for photos. Uploaded images are decoded and re-encoded without original metadata. The upload directory is private to the application and is not served as a static folder.

## React integration

Set `VITE_API_BASE_URL=http://localhost:8080/api/v1` and `VITE_USE_MOCK_API=false` in the frontend environment. The backend allows `http://localhost:5173` through configurable CORS. The frontend's Axios client already sends the stored Bearer token. Public report and comment responses expose nicknames but no email or author account ID.

The existing frontend contract needs these adjustments in its own development stream:

- Backend account role is `CITIZEN`; the current frontend type and checks use `USER`.
- To remove support, call `DELETE /reports/{id}/support`; `POST` adds only once and returns 409 for a duplicate. The current frontend toggle always posts.
- Images are uploaded separately with multipart `files`; `images` URLs in report creation JSON are ignored. Only JPEG and PNG are accepted. The current frontend contract also mentions WebP.
- `authorId` is intentionally omitted from public reports and comments. The current frontend type allows it, and mock filtering uses it; the live `GET /reports/my` endpoint does not need it.
- Feed and admin list responses are arrays to match the current service, with `X-Total-Count`, `X-Page`, and `X-Page-Size` response headers for pagination.
- `district` is optional in the API. The current frontend type marks it required.

See [API examples](docs/API_EXAMPLES.md) for request and response shapes.

## Tests

Run `./gradlew test` or `.\gradlew.bat test`. The test suite covers validation, duplicate registration and support, JWT protected routes, report creation and ownership, pagination parameters, comment creation, image validation, and admin access. The local application additionally requires PostgreSQL to run; unit and web tests do not require an in-memory database.
