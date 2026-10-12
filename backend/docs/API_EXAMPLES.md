# API examples

Base URL: `http://localhost:8080/api/v1`. All dates are ISO 8601 UTC. IDs are UUIDs. Authenticated calls use `Authorization: Bearer <token>`.

## Authentication

```http
POST /api/v1/auth/register
Content-Type: application/json

{"nickname":"SOK Citizen","email":"sok@example.com","password":"StrongPassword123!"}
```

Response `201`:

```json
{"token":"<JWT>","user":{"id":"bb5fc6f1-64c2-4f0f-bec8-a4f3d85d81f4","nickname":"SOK Citizen","email":"sok@example.com","role":"CITIZEN","createdAt":"2026-10-12T09:00:00Z"}}
```

Login is `POST /auth/login` with `{"email":"sok@example.com","password":"StrongPassword123!"}` and returns the same shape (`200`). `GET /auth/me` returns the private `user` object when authenticated.

## Create and browse reports

```http
POST /api/v1/reports
Authorization: Bearer <JWT>
Content-Type: application/json

{"title":"Large pothole on the road","description":"This road is dangerous for motorcycles.","category":"ROAD_DAMAGE","latitude":11.5564,"longitude":104.9282,"province":"Phnom Penh","district":"Daun Penh"}
```

Response `201`:

```json
{"id":"8428c621-c708-4204-bcd8-f82dcc3a5093","title":"Large pothole on the road","description":"This road is dangerous for motorcycles.","category":"ROAD_DAMAGE","status":"REPORTED","authorNickname":"SOK Citizen","latitude":11.5564,"longitude":104.9282,"province":"Phnom Penh","district":"Daun Penh","address":null,"images":[],"supportCount":0,"commentCount":0,"supportedByMe":false,"createdAt":"2026-10-12T09:10:00Z","updatedAt":"2026-10-12T09:10:00Z"}
```

`GET /reports?category=ROAD_DAMAGE&status=REPORTED&province=Phnom%20Penh&search=pothole&sortBy=popular&page=0&size=20` returns a JSON array of report objects. `sortBy` is `latest`, `popular`, or `most_supported`; `page` starts at 0 and `size` is 1–100. Response headers `X-Total-Count`, `X-Page`, and `X-Page-Size` carry pagination metadata. `GET /reports/my` lists the authenticated author's reports. Public report JSON does not include author ID or email.

## Images

```bash
curl -X POST 'http://localhost:8080/api/v1/reports/8428c621-c708-4204-bcd8-f82dcc3a5093/images' \
  -H 'Authorization: Bearer <JWT>' \
  -F 'files=@road.jpg' -F 'files=@road-closeup.png'
```

Response `201`:

```json
[{"id":"53f456b5-3b38-40f0-9564-091e5a19c410","url":"http://localhost:8080/api/v1/reports/8428c621-c708-4204-bcd8-f82dcc3a5093/images/53f456b5-3b38-40f0-9564-091e5a19c410/content","createdAt":"2026-10-12T09:11:00Z"}]
```

Image URLs are absolute and can be used directly in an `<img>` element. Set `PUBLIC_BASE_URL` for a deployed backend origin. `GET /reports/{id}/images` lists metadata. `DELETE /reports/{id}/images/{imageId}` removes one. Maximum five JPEG/PNG files per report, five MB each.

## Supports and comments

`POST /reports/{id}/support` returns `{"supportCount":1,"supportedByMe":true}`. `DELETE /reports/{id}/support` returns `{"supportCount":0,"supportedByMe":false}`. A second `POST` returns `409`.

```http
POST /api/v1/reports/8428c621-c708-4204-bcd8-f82dcc3a5093/comments
Authorization: Bearer <JWT>
Content-Type: application/json

{"content":"Neighbors put a temporary warning sign here."}
```

Response `201`:

```json
{"id":"7e48af56-5104-4dbc-b643-99d1f29afdbc","reportId":"8428c621-c708-4204-bcd8-f82dcc3a5093","authorNickname":"SOK Citizen","content":"Neighbors put a temporary warning sign here.","createdAt":"2026-10-12T09:15:00Z","updatedAt":"2026-10-12T09:15:00Z"}
```

`GET /reports/{id}/comments` is public. `DELETE /comments/{id}` is allowed for the comment author or an administrator.

## Admin

An administrator can call `GET /admin/reports`, `PATCH /admin/reports/{id}/status` with `{"status":"UNDER_REVIEW","adminNote":"Needs moderator review"}`, and `GET /admin/stats`. The admin note is stored for moderators and is not included in public report responses. Status changes are moderation records, not a claim of government action. Administrators can use the regular report and comment deletion endpoints for moderation.

## Errors

```json
{"timestamp":"2026-10-12T09:20:00Z","status":400,"error":"Bad Request","message":"title: size must be between 5 and 120","path":"/api/v1/reports"}
```

Possible statuses: `400` validation, `401` missing/invalid token, `403` insufficient permission, `404` absent resource, `409` duplicate email/support, `413` oversized upload, `500` unexpected error. Responses do not include stack traces or database details.
