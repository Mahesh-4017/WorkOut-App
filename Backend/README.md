# App OTP delivery

The mobile app's email verification and password-reset endpoints are mounted
under `/api/app/auth/otp`. Configure `EMAIL_USER` and `EMAIL_PASS` for
Nodemailer. Gmail accounts should use a Google App Password; other SMTP servers
can use `SMTP_HOST`, `SMTP_PORT`, and `SMTP_SECURE`. `EMAIL_SERVICE` defaults
to `gmail`, and `EMAIL_FROM` optionally overrides the sender address. Set a
private `OTP_SECRET` for keying stored code hashes.

Phone verification requires a separate SMS provider. Set
`OTP_SMS_WEBHOOK_URL` to an HTTPS endpoint accepting a JSON POST with
`channel`, `recipient`, `purpose`, `code`, and `expiresInSeconds`; set
`OTP_DELIVERY_TOKEN` if it requires a bearer token. Without delivery
configuration the API returns 503 and does not claim that a code was sent.

Supported routes are `POST /api/app/auth/otp/send`,
`POST /api/app/auth/otp/verify`, and
`POST /api/app/auth/otp/reset-password`. Codes expire after ten minutes and
are limited to five verification attempts.

# Motion Library Admin Dashboard

## Google sign-in

Create a Google OAuth Web client ID and set it as `GOOGLE_CLIENT_ID` in the backend environment. Set the same value in `Frontend/src/api/config.ts` as `GOOGLE_WEB_CLIENT_ID`. Configure an Android OAuth client with the app package name and signing-certificate SHA-1, and add the reversed iOS client ID as a URL scheme in the iOS target. Google users are created or matched by verified email and appear in the dashboard's user activity table with their sign-in method.

For Apple sign-in, set `APPLE_CLIENT_IDS` to a comma-separated list containing the iOS bundle ID and Android Apple Service ID. Set the Android Service ID in `APPLE_ANDROID_CLIENT_ID` in `Frontend/src/api/config.ts`, and register the configured `APPLE_REDIRECT_URI` as a Return URL for that Service ID. Enable the Sign in with Apple capability for the iOS app target. Apple ID tokens are verified with the configured audiences and request nonce before the user is stored.

A single-admin video card dashboard built with Express, MongoDB/Mongoose, JWT cookies, and a no-build vanilla frontend.

## Setup

1. `cd Backend`
2. `cp .env.example .env` and set `MONGODB_URI`, `JWT_SECRET`, `ADMIN_EMAIL`, and `ADMIN_PASSWORD`.
3. `npm install`
4. Ensure MongoDB is running locally, or use a MongoDB Atlas connection string.
5. `npm run seed`
6. `npm run dev`
7. Open `http://localhost:5000`.

The server exposes both `/api/...` and version-ready `/api/v1/...` routes.

## API examples

```bash
# Login and persist the JWT cookie
curl -i -c cookies.txt -H 'Content-Type: application/json' -d '{"email":"admin@example.com","password":"change-this-password"}' http://localhost:5000/api/auth/login
curl -b cookies.txt http://localhost:5000/api/auth/me
curl -b cookies.txt http://localhost:5000/api/dashboard/stats

# Card CRUD
curl -b cookies.txt -H 'Content-Type: application/json' -d '{"title":"Mobility flow","description":"A short flow","videoUrl":"https://www.youtube.com/watch?v=example","status":"published","tags":["mobility"],"isFeatured":true}' http://localhost:5000/api/cards
curl -b cookies.txt 'http://localhost:5000/api/cards?page=1&limit=10&search=mobility&status=published&sort=-createdAt'
curl -b cookies.txt http://localhost:5000/api/cards/CARD_ID
curl -b cookies.txt http://localhost:5000/api/dashboard/users/USER_ID
curl -X PUT -b cookies.txt -H 'Content-Type: application/json' -d '{"title":"Updated title","videoUrl":"https://vimeo.com/123456"}' http://localhost:5000/api/cards/CARD_ID
curl -X DELETE -b cookies.txt http://localhost:5000/api/cards/CARD_ID
curl -X PATCH -b cookies.txt -H 'Content-Type: application/json' -d '{"items":[{"id":"CARD_ID","order":1}]}' http://localhost:5000/api/cards/reorder

# Public API
curl http://localhost:5000/api/public/cards
curl 'http://localhost:5000/api/public/cards?featured=true&category=Mobility'
curl http://localhost:5000/api/public/cards/CARD_ID
curl http://localhost:5000/api/public/settings

# Settings and password
curl -X PUT -b cookies.txt -H 'Content-Type: application/json' -d '{"siteTitle":"Motion Library","socialLinks":{"youtube":"https://youtube.com/@example"}}' http://localhost:5000/api/settings
curl -X PATCH -b cookies.txt -H 'Content-Type: application/json' -d '{"currentPassword":"old-password","newPassword":"new-password-123"}' http://localhost:5000/api/auth/password
curl -X POST -b cookies.txt http://localhost:5000/api/auth/logout
```

The admin dashboard links to individual video-card and member detail pages.
`GET /api/dashboard/users/:id` returns the selected member's profile and
activity fields to authenticated admins; password hashes are never included.

Home cards use `thumbnailUrl` for their preview image. The card editor accepts
an image URL or an uploaded JPEG, PNG, or WebP image (up to 8 MB), including
drop-to-upload; uploads are persisted in MongoDB GridFS and served from
`/api/media/images/:id`.

## Workout exercise library

Admins manage workout exercises in the Workout library. Each MongoDB exercise
stores its body part, category, muscles, level, duration, equipment, image,
description, instructions, video URL, and draft/published status. Only
published exercises appear in the mobile app. For example, add a `Chest` body
part and an `Upper chest` category to let users browse that muscle group.

```text
POST /api/media/images                      (admin session; multipart image)
GET  /api/public/exercises/body-parts        (published body parts and categories)
GET  /api/public/exercises?bodyPart=Chest&category=Upper%20chest
GET  /api/public/exercises/:id               (published exercise details)
GET  /api/exercises                          (admin list/filter)
POST /api/exercises                          (admin create)
GET  /api/exercises/:id                      (admin detail)
PUT  /api/exercises/:id                      (admin update)
DELETE /api/exercises/:id                    (admin delete)
```

The Next.js website in `website/Frontend/my-app` uses these published
exercise endpoints to browse body parts, filter by category, search exercises,
and view exercise instructions and videos. Featured sessions load from the
public cards API.

## Android APK downloads

The public website's Android download buttons link to the latest GitHub
release asset. The `Build and publish Android APK` GitHub Actions workflow
builds a release APK when Android app files change on `main` (or when manually
started) and publishes it as `WorkOut-App.apk`. A new published release is
required before the latest-download URL has an APK to serve. Automated builds
use a CI debug signing key, so uninstall an earlier app build before installing
a newly downloaded APK.

## Mobile app user API

The React Native app uses a separate bearer-token auth flow. It does not share the single admin account.

```bash
curl -H 'Content-Type: application/json' -d '{"name":"Alex Carter","email":"alex@example.com","password":"password123","gender":"other","age":25,"height":170,"weight":65,"goal":"stay_fit"}' http://localhost:5001/api/app/auth/register
curl -H 'Content-Type: application/json' -d '{"email":"alex@example.com","password":"password123"}' http://localhost:5001/api/app/auth/login
curl -H "Authorization: Bearer APP_TOKEN" http://localhost:5001/api/app/auth/me
curl -X PUT -H "Authorization: Bearer APP_TOKEN" -H 'Content-Type: application/json' -d '{"goal":"build_muscle"}' http://localhost:5001/api/app/profile
```

For the React Native Android emulator, the client uses `http://10.0.2.2:5001/api`. iOS Simulator uses `http://localhost:5001/api`; a physical device must use the computer's LAN IP.

## Mobile app fitness progress data

Fitness progress is stored per authenticated app user in MongoDB. The React
Native app reads the progress bundle from `GET /api/app/progress`; use the
bearer token returned by app registration or login for every request.

```bash
# Add a completed workout session
curl -X POST -H "Authorization: Bearer APP_USER_TOKEN" -H 'Content-Type: application/json' \
  -d '{"workoutId":"w1","title":"Strength session","startedAt":"2026-10-07T09:00:00.000Z","seconds":1800,"calories":210,"distanceKm":0,"movesDone":3,"movesTotal":3,"setsDone":9}' \
  http://localhost:5001/api/app/progress/sessions

# Save or update account goals (send only fields being changed)
curl -X PUT -H "Authorization: Bearer APP_USER_TOKEN" -H 'Content-Type: application/json' \
  -d '{"weeklySessions":4,"targetWeightKg":68,"dailySteps":8000,"dailyCalories":400}' \
  http://localhost:5001/api/app/progress/goals

# Add measurements; steps upsert the current UTC day
curl -X POST -H "Authorization: Bearer APP_USER_TOKEN" -H 'Content-Type: application/json' \
  -d '{"weightKg":72.4}' http://localhost:5001/api/app/progress/weight
curl -X POST -H "Authorization: Bearer APP_USER_TOKEN" -H 'Content-Type: application/json' \
  -d '{"steps":8432}' http://localhost:5001/api/app/progress/steps

# Read sessions, goals, weights, and step records for the signed-in user
curl -H "Authorization: Bearer APP_USER_TOKEN" http://localhost:5001/api/app/progress
```

Workout feedback is saved with
`PATCH /api/app/progress/sessions/SESSION_ID/feedback` using optional `rating`
(1–5), `effort` (1–5), `feel` (string array), and `note` fields. App progress
records are isolated by the verified user token; clients cannot choose another
user's record owner.

## Meal photo nutrition

The mobile app posts meal photos to `POST /api/nutrition/analyze` as multipart form data with the `image` field. Set `ANTHROPIC_API_KEY` in the backend environment; optionally set `ANTHROPIC_MODEL` to override the default model. Keep the key on the server and never add it to the React Native app. The route accepts JPEG, PNG, and WebP images up to 8 MB.

## Deployment

On Render or Railway, set the environment variables from `.env.example`, use `npm start` as the start command, and use a MongoDB Atlas SRV connection string. Set `COOKIE_SECURE=true` behind HTTPS and configure `CLIENT_URL` to the deployed origin. Do not commit `.env`.
