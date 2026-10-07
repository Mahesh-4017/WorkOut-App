# WorkOut website

This Next.js site mirrors the WorkOut app's Home, Explore, Collections,
Calendar, and Profile pages. Published workout content and signed-in progress
are loaded from the backend rather than duplicated in the website.

## Run locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`. The site defaults to the deployed API at
`https://workout-app-g3ag.onrender.com/api`. To use another backend, set
`NEXT_PUBLIC_API_BASE_URL` to its absolute API base URL, for example
`http://localhost:5000/api`.

Sign in with an existing app account to view profile and progress data. Plans
created on the website Calendar are saved to `/api/app/schedule` and shared
with the signed-in app account.

## Android download

The download buttons use the GitHub latest-release URL for
`Mahesh-4017/WorkOut-App`. The repository's Android APK workflow creates that
release when it runs on `main`; until its first successful run, the download
URL has no APK asset. Automated CI APKs use the Android debug key configured
in the app project and are not suitable for Play Store publishing.
