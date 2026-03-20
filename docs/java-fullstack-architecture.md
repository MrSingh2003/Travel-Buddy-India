# Travel Buddy India: Java Full-Stack Architecture

## Stack

- Frontend: React.js with Vite, React Router, TypeScript, Tailwind CSS, ShadCN UI
- API layer: Spring Boot 3
- Data layer: MySQL 8 with Flyway migrations
- AI integration strategy: Java service adapters for Gemini/Imagen-compatible providers
- Delivery: Docker Compose for local orchestration, GitHub Actions for CI/CD
- Build configuration: Maven `pom.xml` files for XML-based Java project management

## Recommended Microservices Split

1. `gateway-service`
   - Single frontend-facing API surface
   - Authentication, request orchestration, rate limiting
2. `planning-service`
   - AI trip planner, suitability scoring, itinerary generation, chatbot
3. `discovery-service`
   - Smart place finder, accommodations, local transport, route summaries
4. `profile-service`
   - User profiles, avatars, storage metadata

## Current Implementation In This Repo

- React pages now call a shared Java API client in `src/lib/api/travel-buddy.ts`.
- A Spring Boot backend lives in `backend/` and exposes API endpoints for:
  - trip planning
  - chat assistant
  - place discovery and poster generation
  - local transport search and booking
  - accommodations
  - route planning
  - profile and avatar generation
- MySQL-ready settings and Flyway SQL migration files are included so the service can evolve from mock responses into persistent storage.

## Database Direction

Core MySQL tables prepared in Flyway:

- `users`
- `trip_requests`
- `bookings`
- `accommodations`
- `transport_partners`

## CI/CD Direction

- Frontend job: install dependencies and run TypeScript validation
- Backend job: boot MySQL service, set up Java 17, run Maven tests
- Local infra: `docker-compose.yml` starts MySQL, Spring Boot backend, and React frontend

## Suggested Next Expansion

1. Split the current backend into dedicated Spring Boot services behind a gateway.
2. Replace mock service methods with repositories and MySQL-backed persistence.
3. Add Spring Security + JWT/Firebase token verification.
4. Introduce OpenFeign/WebClient between gateway and downstream services.
5. Add Terraform or Kubernetes manifests when you are ready to deploy beyond local/dev CI.
