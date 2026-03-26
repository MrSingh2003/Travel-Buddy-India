# Travel Buddy India

Travel Buddy India is a full-stack travel planning app with a Vite + React frontend and a Spring Boot backend. It combines trip planning, route support, local-language UI, profile flows, and email-based authentication features in one project.

## Current Stack

- Frontend: React 18, Vite 5, TypeScript, Tailwind CSS, Radix UI
- Backend: Spring Boot 3.2, Java 17, Maven
- Database: H2 by default for local development, MySQL-compatible schema via Flyway
- Auth: email/password, Google login, OTP verification, password reset, remember-me session handling
- Mail: SMTP-based OTP emails, welcome emails, and support notifications
- CI: GitHub Actions

## Main Features

- AI-assisted trip planning and decision-support flows
- Route, transport, accommodation, and profile APIs
- Email signup and login with OTP verification
- Google login with OTP verification before session completion
- Forgot-password flow with email OTP
- Support form with saved messages and email notification delivery
- Multilingual UI with native language labels

## Project Structure

- `src/`: frontend application
- `backend/`: Spring Boot API and Flyway migrations
- `backend/services/`: early microservice scaffold
- `scripts/`: PowerShell helper scripts for local setup
- `.github/workflows/ci.yml`: frontend and backend CI workflow

## Prerequisites

- Node.js 20+
- npm
- Java 17
- Maven 3.9+

## Run Locally

### Frontend

```bash
npm install
npm run dev
```

Frontend default URL:

```text
http://localhost:9002
```

### Backend

```bash
cd backend
mvn spring-boot:run
```

Backend default URL:

```text
http://localhost:8080
```

API base URL:

```text
http://localhost:8080/api
```

If port `8080` is already in use, set `SERVER_PORT=8081` in your `.env` and update the frontend API base URL to `http://localhost:8081/api`.

### PowerShell Helpers

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\check-prereqs.ps1
powershell -ExecutionPolicy Bypass -File .\scripts\start-local.ps1
powershell -ExecutionPolicy Bypass -File .\backend\start-backend.ps1
powershell -ExecutionPolicy Bypass -File .\backend\stop-backend.ps1
```

## Database

The backend now uses a local H2 file database by default, so MySQL is not required for normal local development.

Default local database:

```text
backend/data/travel_buddy_india
```

H2 console:

```text
http://localhost:8080/h2-console
```

Default connection settings:

- JDBC URL: `jdbc:h2:file:./data/travel_buddy_india;MODE=MySQL;DATABASE_TO_LOWER=TRUE;AUTO_SERVER=TRUE`
- Username: `sa`
- Password: empty

If you want to use MySQL instead, set `DB_URL`, `DB_USER`, and `DB_PASS` in your `.env`.

## Environment Variables

Use `.env.example` as the starting point.

### Frontend

```bash
VITE_TRAVEL_BUDDY_API_BASE_URL=http://localhost:8080/api
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
```

### Backend

```bash
SERVER_PORT=8080
DB_URL=jdbc:h2:file:./data/travel_buddy_india;MODE=MySQL;DATABASE_TO_LOWER=TRUE;AUTO_SERVER=TRUE
DB_USER=sa
DB_PASS=
GEMINI_API_KEY=your_gemini_api_key
SEARCHAPI_API_KEY=your_searchapi_api_key
RAPIDAPI_KEY=your_rapidapi_key
RAPIDAPI_WEBHOOK_URL=https://your-domain.example.com/api/flights/webhook-callback
GOOGLE_MAPS_API_KEY=your_google_maps_api_key
```

### Auth

```bash
AUTH_OTP_TTL_MINUTES=10
```

### Mail and Support

```bash
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=your_email@gmail.com
MAIL_PASSWORD=your_gmail_app_password
SUPPORT_NOTIFICATION_EMAILS=support@example.com
SUPPORT_MAIL_FROM=your_email@gmail.com
```

For Gmail SMTP, use a Gmail App Password, not your normal Gmail account password.

## Auth and Mail Behavior

- Signup sends an OTP email before account activation completes
- Email login sends an OTP email before the session is completed
- Google login also requires OTP verification
- Forgot-password sends an OTP email before password reset
- A welcome email is sent after successful verification
- Support submissions are saved in the backend and can also send email notifications

If SMTP is not configured correctly, auth flows can fall back to a local OTP preview for development instead of blocking all local testing.

## Docker Compose

A `docker-compose.yml` file is included for MySQL-oriented local orchestration. The primary local path is still:

1. frontend with `npm run dev`
2. backend with `mvn spring-boot:run`
3. H2 database by default

If you use Docker Compose, review the environment variables first so they match the backend config you want to run.

## CI

GitHub Actions workflow:

```text
.github/workflows/ci.yml
```

Current CI runs:

- frontend typecheck with Node 20
- backend `mvn -B test` with Java 17

## Security Notes

- Do not commit your real `.env`
- Use `.env.example` as the safe template
- Keep SMTP credentials, API keys, and production DB credentials out of git
- Rotate any secrets that were previously exposed

## Microservice Direction

The main working backend lives in `backend/`. The `backend/services/` folder is a scaffold for a future split into separate services such as:

- gateway-service
- planning-service
- discovery-service
- profile-service

For now, the single Spring Boot backend in `backend/` is the main runtime application.
