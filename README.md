# School Management App

This repository contains a school management system with two parts:

- `mongo-crud-app` — Node/Express backend API (MongoDB-powered).
- `school-management-app` — React frontend (Create React App).

This README explains how to set up and run both locally on Windows (PowerShell).

## Prerequisites

- Node.js (v16+ recommended) and npm installed.
- MongoDB running locally or an accessible MongoDB URI.
- (Optional) AWS credentials and S3 bucket if you want image uploads to work.

## Repository layout

```
mongo-crud-app/        # Backend (Express + Mongoose)
school-management-app/ # Frontend (React)
README.md              # This file
```

## Environment variables (backend)

The backend reads configuration from environment variables (there is a `.env` file in `mongo-crud-app/` that contains example values). Key variables:

- `MONGODB_URI` — MongoDB connection string (default in repo: `mongodb://localhost:27017/crud-demo`).
- `PORT` — Backend port (default `3001`).
- `JWT_SECRET` — Secret for signing JWTs.
- `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_REGION`, `AWS_S3_BUCKET_NAME` — For S3 image uploads.
- `EMAIL_USER`, `EMAIL_PASS` — SMTP/email credentials used by the app.

Important: the repo currently contains a `.env` file with values. Treat these as sensitive and rotate any real credentials before publishing or deploying.

## Running locally (development)

Open two PowerShell terminals (one for backend, one for frontend) and run the steps below.

### 1) Start backend (API)

```powershell
cd d:\Projects\school-management-app\mongo-crud-app
npm install
# Start in dev mode (auto-restart on changes)
npm run dev
# Or to run without nodemon:
npm start
```

The API will be available at `http://localhost:3001` (or the port defined in `PORT`). A quick check:

```powershell
Invoke-WebRequest http://localhost:3001/ | Select-Object -ExpandProperty Content
```

Expect JSON: `{ "message": "API is up and running!" }` when the server is running.

If MongoDB is not running locally, update `MONGODB_URI` in `mongo-crud-app/.env` to point to a remote cluster.

### 2) Start frontend (React)

```powershell
cd d:\Projects\school-management-app\school-management-app
npm install
npm start
```

This runs the Create React App dev server (default: `http://localhost:3000`). The frontend calls the API on `http://localhost:3001`.

### 3) Serve built frontend from backend (optional)

To produce a production build and have the backend serve it:

```powershell
# Build frontend
cd d:\Projects\school-management-app\school-management-app
npm run build

# Copy (or move) the generated `build` folder into the backend project root
# Example (PowerShell):
Remove-Item -Recurse -Force d:\Projects\school-management-app\mongo-crud-app\build -ErrorAction SilentlyContinue
Copy-Item -Recurse -Force .\build d:\Projects\school-management-app\mongo-crud-app\build

# Start backend (will serve static files)
cd d:\Projects\school-management-app\mongo-crud-app
npm start
```

The backend will serve the React `index.html` and static assets when a build is present.

## Quick troubleshooting

- "MongoDB connection error": ensure MongoDB is running and `MONGODB_URI` is correct.
- "PORT in use": change `PORT` in `.env` or stop the process using the port.
- AWS/S3 upload issues: confirm credentials and that the bucket exists in the configured region.
- If the frontend fails to start due to node-gyp/native builds, ensure you have the appropriate Windows build tools installed (rare for this project but possible if native deps appear).

## Security note

The repository contains an example `.env` file with secrets. Do not commit real secrets to public repositories. Rotate any exposed credentials immediately.

## Useful scripts

Backend (`mongo-crud-app/package.json`):
- `npm start` — run `node index.js` (production style).
- `npm run dev` — run `nodemon index.js` (development).

Frontend (`school-management-app/package.json`):
- `npm start` — start CRA dev server.
- `npm run build` — build production assets.

## Tests & scripts

There are several utility scripts under `mongo-crud-app/scripts/` for importing data and verifying billing/timetable. They are Node scripts and can be executed with `node`.

Example:
```powershell
cd d:\Projects\school-management-app\mongo-crud-app
node scripts/verify-timetable.js
```

## Next steps / suggestions

- Remove actual secrets and replace them with placeholder values; add `.env` to `.gitignore` if not already.
- Add a short `CONTRIBUTING.md` describing how to run the project and expected API contract for contributors.
- Add small automated smoke tests to verify the API endpoints after start.

---
