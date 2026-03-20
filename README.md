# Travel Buddy India

Travel Buddy India is now structured as a Java full-stack application with a React frontend and a Spring Boot backend designed to grow into a microservices architecture.

## Current Stack

- Frontend: React, Vite, React Router, TypeScript, Tailwind CSS, ShadCN UI
- Backend: Spring Boot 3, REST APIs, Flyway, MySQL-ready configuration
- Database: MySQL 8
- DevOps: Docker Compose, GitHub Actions CI
- Build: XML-based Maven configuration in `backend/pom.xml`

## What Was Added

- Java backend endpoints for trip planning, chat, discovery, transport, accommodations, routes, and profile/avatar flows
- Shared React API client at `src/lib/api/travel-buddy.ts`
- MySQL Flyway baseline schema in `backend/src/main/resources/db/migration/V1__baseline.sql`
- Local orchestration in `docker-compose.yml`
- CI pipeline in `.github/workflows/ci.yml`
- Architecture notes in `docs/java-fullstack-architecture.md`

## Run Locally

### Option 1: Docker Compose

```bash
docker compose up --build
```

PowerShell shortcut:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\start-docker.ps1
```

Frontend:
- `http://localhost:9002`

Backend:
- `http://localhost:8080/api`

MySQL:
- `localhost:3306`

### Option 2: Run Separately

Backend prerequisites:
- Java 17+
- Maven 3.9+
- MySQL 8+

Frontend prerequisites:
- Node.js 20+
- npm

Backend:

```bash
cd backend
mvn spring-boot:run
```

Frontend:

```bash
npm install
npm run dev
```

PowerShell shortcuts:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\check-prereqs.ps1
powershell -ExecutionPolicy Bypass -File .\scripts\start-local.ps1
```

Microservice scaffold:

```bash
cd backend/services
mvn -pl gateway-service spring-boot:run
mvn -pl planning-service spring-boot:run
mvn -pl discovery-service spring-boot:run
mvn -pl profile-service spring-boot:run
```

## Environment

Optional frontend env:

```bash
VITE_TRAVEL_BUDDY_API_BASE_URL=http://localhost:8080/api
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_key
```

Optional backend env:

```bash
MYSQL_URL=jdbc:mysql://localhost:3306/travel_buddy_india
MYSQL_USERNAME=travelbuddy
MYSQL_PASSWORD=travelbuddy
```

## MySQL Username And Password

If you do not know your current local MySQL username/password, the fastest path is usually to create a project-specific user.

Example in MySQL:

```sql
CREATE DATABASE IF NOT EXISTS travel_buddy_india;
CREATE USER IF NOT EXISTS 'travelbuddy'@'localhost' IDENTIFIED BY 'travelbuddy';
GRANT ALL PRIVILEGES ON travel_buddy_india.* TO 'travelbuddy'@'localhost';
FLUSH PRIVILEGES;
```

Then use:

```bash
MYSQL_USERNAME=travelbuddy
MYSQL_PASSWORD=travelbuddy
```

## GitHub Preparation

This repository is ready to be pushed to GitHub after one important cleanup step:

- Do not commit your real `.env`
- Use `.env.example` as the safe template
- Rotate any live API keys that were previously shared

Recommended files to keep out of GitHub:

- `.env`
- `node_modules/`
- `dist/`
- `.next/`
- local database files

Recommended first commands on your machine:

```bash
git init
git add .
git commit -m "Initial Java full-stack Travel Buddy India setup"
git branch -M main
git remote add origin https://github.com/<your-username>/<your-repo>.git
git push -u origin main
```

If `.env` was ever staged before, remove it from git tracking first:

```bash
git rm --cached .env
git add .gitignore .env.example
git commit -m "Remove secrets and add safe env example"
```

## Deployment Recommendation

Best practical hosting split for this project:

### Frontend

Deploy the React/Vite frontend from GitHub to one of:

- Vercel
- Netlify
- Render Static Site

Production frontend env:

```bash
VITE_TRAVEL_BUDDY_API_BASE_URL=https://your-backend-domain/api
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_key
```

### Backend

Deploy the Spring Boot backend from GitHub to one of:

- Render Web Service
- Railway
- Fly.io
- AWS Elastic Beanstalk / ECS

Production backend env:

```bash
MYSQL_URL=jdbc:mysql://<host>:3306/travel_buddy_india
MYSQL_USERNAME=<db_user>
MYSQL_PASSWORD=<db_password>
GEMINI_API_KEY=<gemini_key>
SEARCHAPI_API_KEY=<searchapi_key>
```

### Database

Use a hosted MySQL provider such as:

- Railway MySQL
- Aiven MySQL
- PlanetScale-compatible MySQL setup
- AWS RDS MySQL

## GitHub Actions CI

This project already includes GitHub Actions in:

```bash
.github/workflows/ci.yml
```

It can be extended to:

- build the React frontend
- build the Spring Boot backend
- run tests
- deploy automatically on push to `main`

## Important Security Note

Because live API keys were used during setup, rotate these before public GitHub hosting:

- Google Maps API key
- Gemini API key
- SearchAPI key

Then place the new values only in deployment environment variables, not in committed files.

If you can log in as root but want to reset the app user's password:

```sql
ALTER USER 'travelbuddy'@'localhost' IDENTIFIED BY 'travelbuddy';
FLUSH PRIVILEGES;
```

## Architecture

Recommended target services:

1. `gateway-service`
2. `planning-service`
3. `discovery-service`
4. `profile-service`

The current backend in `backend/` acts as a strong starting point and API consolidation layer while the project moves toward a full microservices split.

## What You Still Need To Change On Your Machine

This workspace could not run the app end-to-end because the current environment is missing:

- Maven
- npm / Node.js
- Docker
- Java 17

The detected Java version here is Java 10, but Spring Boot 3 requires Java 17+.

Before running locally, install:

1. Java 17 or 21
2. Maven 3.9+
3. Node.js 20+
4. MySQL 8+ or Docker Desktop

Then the first things to verify are:

1. `.env` values
2. MySQL user/password
3. Google Maps APIs enabled for the supplied key
4. Gemini and SearchAPI quota/access
