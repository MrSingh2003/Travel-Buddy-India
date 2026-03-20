# Planned Spring Boot Microservices

This repository currently exposes a consolidated Spring Boot backend in `backend/` so the React frontend has a stable Java API surface.

The intended next split is:

1. `gateway-service`
   - Frontend-facing API gateway
   - auth, routing, aggregation
2. `planning-service`
   - trip planner, chatbot, scoring, itinerary generation
3. `discovery-service`
   - places, accommodations, local transport, route summaries
4. `profile-service`
   - user profiles, avatar generation, media metadata

When you want, I can take the next pass and scaffold these into separate Maven modules with Spring Cloud components.
