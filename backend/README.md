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

Check `http://localhost:8080/api/v1/health`. Swagger UI is at `http://localhost:8080/swagger-ui/index.html`; OpenAPI JSON is at `http://localhost:8080/v3/api-docs`. Real-time STOMP WebSocket is at `ws://localhost:8080/ws` (SockJS at `http://localhost:8080/ws`) with public topics `/topic/reports` and `/topic/reports/{reportId}`. Flyway migrates the schema on startup and Hibernate validates it.

### Optional MVP example reports

To populate the real PostgreSQL database for an MVP walkthrough, run this once from `backend` with the same `.env` and `UPLOAD_DIR` as the running API:

```powershell
.\gradlew.bat seedMvp
```

The task inserts five **clearly labeled examples** with generated illustrative images: road damage, blocked drainage, uncollected waste, a broken streetlight, and roadside flooding. They appear through the normal API in the feed, map, and the `FixKH MVP Demo` public profile. Their pins are approximate district centers, not verified incident locations. The seed account cannot be used to sign in. The task is opt-in and uses fixed IDs, so repeating it does not create duplicate reports or change other users' data. Image files are placed in `UPLOAD_DIR`; keep that directory available to the API. Replace these examples with consented, verified submissions before presenting the site as a live civic feed.

#### Seed the examples on another machine

Your teammate does not need a ZIP of the project or a copy of `backend/uploads`. The five source images and the seed task are committed to Git. After cloning the repository (or running `git pull` in an existing checkout), they can configure their own private `backend/.env` for their PostgreSQL database and run:

```powershell
cd backend
.\gradlew.bat seedMvp
```

On macOS/Linux, run `./gradlew seedMvp` instead. The task creates the five example posts and copies their images from `src/main/resources/mvp-seed/` into the configured `UPLOAD_DIR`. Run it on the machine that serves the backend, or use an upload directory shared with that machine. If a teammate seeds a shared database from a different computer but keeps images in their own local `UPLOAD_DIR`, the backend serving the site will not be able to display those images. Running the task again with the backend's `UPLOAD_DIR` restores any missing seed image files without duplicating the posts.

Two example posts are entirely in Khmer, two are entirely in English, and one mixes both languages. Each has a short demo notice. To update their titles and descriptions after changing the seed copy, run `.\gradlew.bat refreshMvp`. This updates only the seed-owned reports; it does not change their images, locations, moderation statuses, or other users' reports.

Registration sends a six-digit code by email. Configure a verified `otp_email` sender plus `SMTP_HOST`, `SMTP_PORT`, `SMTP_USERNAME`, and `SMTP_PASSWORD` in your private `.env`. For [Brevo SMTP](https://help.brevo.com/hc/en-us/articles/7924908994450-Send-transactional-emails-using-Brevo-SMTP), use `smtp-relay.brevo.com`, port `587`, the SMTP login shown in Brevo, and an SMTP key (not an API key). The sender address must be verified with your provider. Never put SMTP credentials in the frontend environment or commit them to Git. Without valid mail settings, registration returns `503`; other backend endpoints still start normally.

### Optional authenticator app MFA

Set `TWO_FACTOR_ENCRYPTION_KEY` in the private `.env` to the Base64 encoding of **32 random bytes**. Keep this key stable and backed up securely: changing or losing it makes existing authenticator setups unreadable. The app starts without this key, but MFA setup and login for MFA-enabled users fail closed with `503`.

Users can opt in from frontend Settings after signing in. Setup requires their current password, displays a QR code or manual setup key, and becomes active only after they enter a valid six-digit app code. Eight one-time recovery codes are then displayed once; users must store them safely. Each login first checks the password, then requires a current authenticator code or unused recovery code before issuing a JWT. Five incorrect MFA attempts lock the account's MFA step for 15 minutes. Enabling or disabling MFA invalidates existing JWTs.

For accounts without MFA, the backend counts successful password sign-ins and returns `mfaSetupReminder: true` once after a randomly chosen 3–6 sign-ins. The counter then starts a new random interval. Failed sign-ins, registration, and MFA-protected logins do not advance it. The frontend shows a dismissible reminder linking to Settings; it does not block access.

The endpoints are `GET /api/v1/auth/mfa/status`, `POST /api/v1/auth/mfa/setup` with `{"password":"..."}`, `POST /api/v1/auth/mfa/confirm` with `{"code":"123456"}`, public `POST /api/v1/auth/mfa/verify-login` with `{"challengeToken":"...","code":"123456"}`, and `POST /api/v1/auth/mfa/disable` with `{"password":"...","code":"123456"}`. Setup, confirm, status, and disable require an access token. A password login for an MFA-enabled account returns `mfaRequired: true` and a short-lived challenge token instead of an access token.

To create a **development-only** administrator, set `SPRING_PROFILES_ACTIVE=dev`, `FIXKH_DEV_ADMIN_EMAIL`, `FIXKH_DEV_ADMIN_PASSWORD` (at least 12 characters), and optionally `FIXKH_DEV_ADMIN_NICKNAME` before startup. Bootstrap creates the account only if the email is unused. Never enable the dev profile or bootstrap credentials in production. Public registration always creates `CITIZEN`.

## Try the API

Request a registration code:

```bash
curl -X POST http://localhost:8080/api/v1/auth/register -H 'Content-Type: application/json' -d '{"email":"sok@example.com"}'
```

The API returns `202` and emails a code that expires after 10 minutes. Finish registration with `POST /api/v1/auth/verify-registration` and `{"nickname":"SOK Citizen","email":"sok@example.com","password":"StrongPassword123!","code":"123456"}` using the actual emailed code. This returns a JWT. Codes are hashed in PostgreSQL, allow five guesses, and can be requested at most once per minute and three times per hour per email. Log in later with `POST /api/v1/auth/login` using `{"email":"sok@example.com","password":"StrongPassword123!"}`. Copy the returned `token` into Swagger's **Authorize** dialog, then create a report with `POST /api/v1/reports` and the body below. Swagger sends `Authorization: Bearer <token>` automatically.

Forgotten passwords use `POST /api/v1/auth/forgot-password` with `{"email":"sok@example.com"}`. The endpoint returns `202` with the same message whether the account exists or not. If it exists, the backend emails a separate six-digit reset code. Submit `{"email":"sok@example.com","code":"123456","password":"NewPassword123!"}` to `POST /api/v1/auth/reset-password`; success returns `204`. The code expires after 10 minutes, allows five incorrect guesses, and is single use. Requesting a new code is limited to once per minute and three times per hour per account. A successful reset revokes existing JWTs while leaving authenticator MFA enabled. The user signs in normally afterward.

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

Only `ADMIN` accounts can call `PATCH /api/v1/admin/reports/{id}/status`. The admin can select `RESOLVED` and optionally add an admin note; the API does not require evidence of completed work or confirmation from the reporter or an agency. Statuses describe FixKH moderation activity, not independently verified repairs.

## React integration

Set `VITE_API_BASE_URL=http://localhost:8080/api/v1` and `VITE_USE_MOCK_API=false` in the frontend environment. The backend allows `http://localhost:5173` through configurable CORS. The frontend's Axios client already sends the stored Bearer token. Public report and comment responses expose nicknames but no email or author account ID.

With `VITE_USE_MOCK_API=true`, the frontend uses instant demo registration and does not send email codes. Restart the Vite server after changing that value.

The existing frontend contract needs these adjustments in its own development stream:

- To remove support, call `DELETE /reports/{id}/support`; `POST` adds only once and returns 409 for a duplicate. The current frontend toggle always posts.
- Images are uploaded separately with multipart `files`; `images` URLs in report creation JSON are ignored. Only JPEG and PNG are accepted. The current frontend contract also mentions WebP.
- `authorId` is intentionally omitted from public reports and comments. The current frontend type allows it, and mock filtering uses it; the live `GET /reports/my` endpoint does not need it.
- Feed and admin list responses are arrays to match the current service, with `X-Total-Count`, `X-Page`, and `X-Page-Size` response headers for pagination.
- `district` is optional in the API. The current frontend type marks it required.

See [API examples](docs/API_EXAMPLES.md) for request and response shapes.

## Tests

Run `./gradlew test` or `.\gradlew.bat test`. The test suite covers validation, hashed registration codes and limits, login and JWT protected routes, report creation and ownership, pagination parameters, comment creation, image validation, and admin access. The local application additionally requires PostgreSQL to run; unit and web tests do not require an in-memory database or send real email.
