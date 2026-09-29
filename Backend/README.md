# Motion Library Admin Dashboard

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

## Mobile app user API

The React Native app uses a separate bearer-token auth flow. It does not share the single admin account.

```bash
curl -H 'Content-Type: application/json' -d '{"name":"Alex Carter","email":"alex@example.com","password":"password123","gender":"other","age":25,"height":170,"weight":65,"goal":"stay_fit"}' http://localhost:5001/api/app/auth/register
curl -H 'Content-Type: application/json' -d '{"email":"alex@example.com","password":"password123"}' http://localhost:5001/api/app/auth/login
curl -H "Authorization: Bearer APP_TOKEN" http://localhost:5001/api/app/auth/me
curl -X PUT -H "Authorization: Bearer APP_TOKEN" -H 'Content-Type: application/json' -d '{"goal":"build_muscle"}' http://localhost:5001/api/app/profile
```

For the React Native Android emulator, the client uses `http://10.0.2.2:5001/api`. iOS Simulator uses `http://localhost:5001/api`; a physical device must use the computer's LAN IP.

## Deployment

On Render or Railway, set the environment variables from `.env.example`, use `npm start` as the start command, and use a MongoDB Atlas SRV connection string. Set `COOKIE_SECURE=true` behind HTTPS and configure `CLIENT_URL` to the deployed origin. Do not commit `.env`.
