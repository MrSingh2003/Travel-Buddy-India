package com.travelbuddyindia.backend.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.travelbuddyindia.backend.model.BookingEntity;
import com.travelbuddyindia.backend.model.TripRequestEntity;
import com.travelbuddyindia.backend.model.UserProfileEntity;
import com.travelbuddyindia.backend.repository.BookingRepository;
import com.travelbuddyindia.backend.repository.TripRequestRepository;
import com.travelbuddyindia.backend.repository.UserProfileRepository;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.Base64;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

@Service
public class MockCatalogService {

  private final RestClient restClient;
  private final ObjectMapper objectMapper;
  private final String geminiApiKey;
  private final String searchApiKey;
  private final String rapidApiKey;
  private final String rapidApiWebhookUrl;
  private final TripRequestRepository tripRequestRepository;
  private final BookingRepository bookingRepository;
  private final UserProfileRepository userProfileRepository;

  public MockCatalogService(
      RestClient.Builder restClientBuilder,
      ObjectMapper objectMapper,
      TripRequestRepository tripRequestRepository,
      BookingRepository bookingRepository,
      UserProfileRepository userProfileRepository,
      @Value("${google.ai.api-key:}") String geminiApiKey,
      @Value("${searchapi.api-key:}") String searchApiKey,
      @Value("${rapidapi.key:}") String rapidApiKey,
      @Value("${rapidapi.webhook-url:}") String rapidApiWebhookUrl) {
    this.restClient = restClientBuilder.build();
    this.objectMapper = objectMapper;
    this.tripRequestRepository = tripRequestRepository;
    this.bookingRepository = bookingRepository;
    this.userProfileRepository = userProfileRepository;
    this.geminiApiKey = geminiApiKey == null ? "" : geminiApiKey.trim();
    this.searchApiKey = searchApiKey == null ? "" : searchApiKey.trim();
    this.rapidApiKey = rapidApiKey == null ? "" : rapidApiKey.trim();
    this.rapidApiWebhookUrl = rapidApiWebhookUrl == null ? "" : rapidApiWebhookUrl.trim();
  }

  public List<PlaceResult> searchPlaces(String query, String location) {
    if (hasSearchApiKey()) {
      try {
        JsonNode root = searchApiRequest(Map.of(
            "engine", "google_maps",
            "q", query + " in " + location,
            "hl", "en",
            "gl", "in"));

        JsonNode localResults = root.path("local_results");
        if (localResults.isArray() && !localResults.isEmpty()) {
          List<PlaceResult> results = new ArrayList<>();
          for (JsonNode node : localResults) {
            results.add(new PlaceResult(
                node.path("position").asInt(results.size() + 1),
                textValue(node, "title", "name", "place_name", "business_name"),
                textValue(node, "address"),
                node.path("rating").asDouble(4.3),
                node.path("reviews").asInt(node.path("reviews_count").asInt(0)),
                textValue(node, "type", "category"),
                textValue(node, "thumbnail", "image", "photo")));
            if (results.size() >= 8) {
              break;
            }
          }
          if (!results.isEmpty()) {
            return results;
          }
        }
      } catch (Exception ignored) {
        // Fall back to deterministic mock data when external providers fail.
      }
    }

    return mockPlaces(query, location);
  }

  public List<Accommodation> hotels() {
    return hotels("all", LocalDate.now().plusDays(7), LocalDate.now().plusDays(9), 1, "INR", "India");
  }

  public List<Accommodation> hotels(
      String location,
      LocalDate checkIn,
      LocalDate checkOut,
      int adults,
      String currency,
      String locale) {
    if (hasRapidApiKey() && location != null && !"all".equalsIgnoreCase(location)) {
      String propertyId = rapidHotelPropertyIdFor(location);
      if (!propertyId.isBlank()) {
        try {
          Accommodation liveAccommodation =
              rapidHotelDetails(propertyId, location, checkIn, checkOut, adults, currency, locale);
          if (liveAccommodation != null) {
            return List.of(liveAccommodation);
          }
        } catch (Exception ignored) {
          // fall back to local mock list
        }
      }
    }

    return List.of(
        new Accommodation("hotel-1", "The Mountain View", "Shimla, Himachal Pradesh", 4.5,
            List.of("WiFi", "Heater", "Restaurant"), "INR 4500/night",
            "https://picsum.photos/seed/mountain-hotel/600/400", "hotel", null),
        new Accommodation("hotel-2", "Desert Mirage Resort", "Jaisalmer, Rajasthan", 4.8,
            List.of("Pool", "Camel Safari", "WiFi"), "INR 7000/night",
            "https://picsum.photos/seed/desert-hotel/600/400", "hotel", null),
        new Accommodation("hotel-3", "Backwater Bungalows", "Alleppey, Kerala", 4.7,
            List.of("Houseboat", "Free Breakfast", "AC"), "INR 6000/night",
            "https://picsum.photos/seed/backwater-hotel/600/400", "hotel", null),
        new Accommodation("hotel-4", "City Comfort Inn", "New Delhi, Delhi", 4.1,
            List.of("WiFi", "Room Service", "Airport Shuttle"), "INR 3500/night",
            "https://picsum.photos/seed/city-hotel/600/400", "hotel", null));
  }

  public List<Accommodation> dharamshalas() {
    return List.of(
        new Accommodation("dharamshala-1", "Gita Bhavan", "Rishikesh, Uttarakhand", 4.2,
            List.of("Ganga View", "Satsang Hall", "Basic Rooms"), "Donation based",
            "https://picsum.photos/seed/gita-bhavan/600/400", "dharamshala", null),
        new Accommodation("dharamshala-2", "Bangur Dharamshala", "Nathdwara, Rajasthan", 4.0,
            List.of("AC/Non-AC", "Close to Temple", "Canteen"), "INR 500/night",
            "https://picsum.photos/seed/nathdwara-dharamshala/600/400", "dharamshala", null));
  }

  public List<TransportOption> cabs(String location) {
    String city = cityOnly(location);
    if (hasRapidApiKey() && !city.isBlank()) {
      try {
        List<TransportOption> rapidResults = rapidCabLocations(city);
        if (!rapidResults.isEmpty()) {
          return rapidResults;
        }
      } catch (Exception ignored) {
        // fall back to local mock list
      }
    }
    return List.of(
            new TransportOption("cab-1", "Himalayan Nomad Cabs", "Manali, Himachal Pradesh", "cab",
                "Approx. INR 2500/day", "+91-9876543210", true, null, null, null, null, null, null, null, null, "Local operator"),
            new TransportOption("cab-2", "Rann Riders", "Bhuj, Gujarat", "cab",
                "Approx. INR 3000/day for SUV", "+91-9876543211", true, null, null, null, null, null, null, null, null, "Local operator"),
            new TransportOption("cab-3", "Coorg Cabs", "Madikeri, Karnataka", "cab",
                "Approx. INR 2200/day", "+91-9876543212", false, null, null, null, null, null, null, null, null, "Community-listed operator"),
            new TransportOption("cab-4", "Sikkim Taxi Service", "Gangtok, Sikkim", "cab",
                "Point to point basis", "+91-9876543213", true, null, null, null, null, null, null, null, null, "Local operator"))
        .stream()
        .filter(option -> option.location().toLowerCase(Locale.ENGLISH).contains(city.toLowerCase(Locale.ENGLISH)))
        .toList();
  }

  public List<TransportOption> buses(String from, String to) {
    String start = cityOnly(from);
    String end = cityOnly(to);
    return List.of(
            new TransportOption("bus-1", "VRL Travels", start + " to " + end, "bus", "INR 2100", null, true,
                "Volvo A/C Sleeper (2+1)", start, end, "18:00", "10:00", "16h 0m", 4.5, null, null),
            new TransportOption("bus-2", "Sharma Transports", start + " to " + end, "bus", "INR 1850", null, true,
                "Scania A/C Seater (2+2)", start, end, "19:30", "12:30", "17h 0m", 4.2, null, null),
            new TransportOption("bus-3", "KSRTC Airavat", start + " to " + end, "bus", "INR 2500", null, true,
                "Mercedes-Benz Multi-Axle", start, end, "20:00", "12:00", "16h 0m", 4.8, null, null))
        .stream()
        .filter(option -> !start.equalsIgnoreCase(end))
        .toList();
  }

  public List<TransportOption> trains(String from, String to) {
    String start = cityOnly(from);
    String end = cityOnly(to);
    return List.of(
            new TransportOption("train-1", "Shatabdi Express", start + " to " + end, "train", "INR 1500", null, true,
                "AC Chair Car", start, end, "06:00", "13:45", "7h 45m", 4.4, null, null),
            new TransportOption("train-2", "Rajdhani Express", start + " to " + end, "train", "INR 3200", null, true,
                "AC 2 Tier", start, end, "20:40", "09:15", "12h 35m", 4.7, null, null))
        .stream()
        .filter(option -> !start.equalsIgnoreCase(end))
        .toList();
  }

  public FlightWebhookResponse subscribeFlightWebhook(FlightWebhookRequest request) {
    if (!hasRapidApiKey()) {
      return new FlightWebhookResponse("fallback",
          "RapidAPI key is not configured, so flight webhook subscription is running in mock mode.");
    }

    String callbackUrl =
        request.url() == null || request.url().isBlank() ? rapidApiWebhookUrl : request.url();
    if (callbackUrl == null || callbackUrl.isBlank()) {
      return new FlightWebhookResponse("error",
          "Provide a callback URL or set RAPIDAPI_WEBHOOK_URL in the backend environment.");
    }

    try {
      String flightNumber = request.flightNumber().replace(" ", "").trim();
      String body = restClient.post()
          .uri("https://aerodatabox.p.rapidapi.com/subscriptions/webhook/FlightByNumber/" + flightNumber
              + "?useCredits=" + request.useCredits())
          .header("Content-Type", "application/json")
          .header("x-rapidapi-host", "aerodatabox.p.rapidapi.com")
          .header("x-rapidapi-key", rapidApiKey)
          .body(objectMapper.writeValueAsString(Map.of(
              "url", callbackUrl,
              "maxDeliveryRetries", 0)))
          .retrieve()
          .body(String.class);
      return new FlightWebhookResponse("success", body);
    } catch (Exception exception) {
      return new FlightWebhookResponse("error",
          "Could not create the flight webhook right now. " + exception.getMessage());
    }
  }

  public RoutePlan planRoute(String origin, String destination, String mode) {
    String normalizedMode = normalizeMode(mode);
    if (hasSearchApiKey()) {
      try {
        JsonNode root = searchApiRequest(Map.of(
            "engine", "google_maps_directions",
            "from", origin,
            "to", destination,
            "mode", normalizedMode.toLowerCase(Locale.ENGLISH),
            "distance_units", "km",
            "hl", "en",
            "gl", "in"));
        JsonNode directions = root.path("directions");
        if (directions.isArray() && !directions.isEmpty()) {
          JsonNode firstRoute = directions.get(0);
          List<String> waypoints = new ArrayList<>();
          waypoints.add(origin);
          JsonNode instructions = firstRoute.path("instructions");
          if (instructions.isArray()) {
            for (int i = 0; i < instructions.size() && i < 3; i++) {
              JsonNode instruction = instructions.get(i);
              String action = textValue(instruction, "action");
              if (!action.isBlank()) {
                waypoints.add(action);
              }
            }
          }
          waypoints.add(destination);
          return new RoutePlan(
              origin,
              destination,
              normalizedMode,
              textValue(firstRoute, "formatted_distance"),
              textValue(firstRoute, "formatted_duration"),
              waypoints);
        }
      } catch (Exception ignored) {
        // Fall back to local route estimation.
      }
    }
    return mockRoute(origin, destination, normalizedMode);
  }

  public PersonalizedTripResponse generateTrip(PersonalizedTripRequest request) {
    PersonalizedTripResponse response;
    if (hasGeminiKey()) {
      try {
        String prompt =
            "You are a travel decision support engine for Indian travel. "
                + "Return strict JSON only with keys: tripTitle, suitabilityScore, suitabilityReasoning, "
                + "tripSummary, budgetBreakdown, weatherAdvisory, dailyItinerary. "
                + "budgetBreakdown must contain accommodation, food, transport, activities, total. "
                + "dailyItinerary must be an array of objects with day, title, activities. "
                + "User input: origin=" + request.currentLocation()
                + ", destination=" + request.location()
                + ", startDate=" + request.startDate()
                + ", endDate=" + request.endDate()
                + ", budgetInr=" + request.budget()
                + ", travelers=" + request.numberOfPeople()
                + ", interests=" + request.interests() + ".";

        String raw = geminiText("gemini-2.5-flash", prompt);
        String json = extractJson(raw);
        PersonalizedTripResponse liveResponse =
            objectMapper.readValue(json, PersonalizedTripResponse.class);
        if (liveResponse != null && liveResponse.dailyItinerary() != null) {
          response = liveResponse;
          persistTrip(request, response);
          return response;
        }
      } catch (Exception ignored) {
        // Fall back to deterministic local generation.
      }
    }
    response = mockTrip(request);
    persistTrip(request, response);
    return response;
  }

  public ChatResponse answerQuestion(ChatRequest request) {
    if (hasGeminiKey()) {
      try {
        String answer = geminiText(
            "gemini-2.5-flash",
            "You are Travel Buddy India, a concise Indian travel assistant. Answer this question helpfully: "
                + request.question());
        if (!answer.isBlank()) {
          return new ChatResponse(answer);
        }
      } catch (Exception ignored) {
        // Fall back to local response.
      }
    }
    return new ChatResponse(
        "For travel in India, keep one digital and one offline backup of tickets, carry small cash for local transport, "
            + "and check weather before intercity travel. For your question \"" + request.question()
            + "\", I recommend comparing route timing, local demand, and total spend before booking.");
  }

  public PosterResponse poster(String city, String query) {
    if (hasGeminiKey()) {
      try {
        String imageUrl = geminiImage(
            "Create an inspirational travel poster for " + city
                + ", India, themed around " + query
                + ". Use vivid orange accents, tourism-poster composition, and cinematic lighting.");
        if (!imageUrl.isBlank()) {
          return new PosterResponse(city + " Travel Poster", imageUrl);
        }
      } catch (Exception ignored) {
        // Fall back to deterministic placeholder image.
      }
    }
    return new PosterResponse(
        city + " Travel Poster",
        "https://picsum.photos/seed/" + seed(city + query + "poster") + "/1200/800");
  }

  public AvatarResponse avatar(AvatarRequest request) {
    if (hasGeminiKey()) {
      try {
        String imageUrl = geminiImage(
            request.prompt() + ". Digital painting style portrait, polished travel-app avatar, warm expression.");
        if (!imageUrl.isBlank()) {
          return new AvatarResponse(imageUrl);
        }
      } catch (Exception ignored) {
        // Fall back to deterministic placeholder image.
      }
    }
    return new AvatarResponse(
        "https://picsum.photos/seed/" + seed(request.prompt() + "avatar") + "/512/512");
  }

  public BookingResponse book(BookingRequest request) {
    String bookingCode = "TB-" + Math.abs((request.serviceType() + request.details()).hashCode() % 10000);
    BookingEntity entity = new BookingEntity();
    entity.setBookingCode(bookingCode);
    entity.setServiceType(request.serviceType());
    entity.setServiceName(request.details());
    entity.setBookingStatus("CONFIRMED");
    entity.setCustomerReference("demo-user");
    bookingRepository.save(entity);
    return new BookingResponse(
        bookingCode,
        "Your " + request.serviceType() + " booking is confirmed for " + request.details() + ".");
  }

  public UserProfileResponse profile() {
    UserProfileEntity profile = userProfileRepository.findByExternalId("demo-user")
        .orElseGet(() -> {
          UserProfileEntity entity = new UserProfileEntity();
          entity.setExternalId("demo-user");
          entity.setFullName("Your Name");
          entity.setEmail("yourname@example.com");
          entity.setPhoneNumber("+91-9876543210");
          entity.setLocation("Your area, your city, your state");
          entity.setCity("Your City");
          entity.setStateName("Your State");
          entity.setPostalCode("000000");
          entity.setEmergencyContactName("Emergency Contact");
          entity.setEmergencyContactPhone("+91-9876543211");
          entity.setPhotoUrl("https://picsum.photos/seed/travel-buddy-profile/300/300");
          return userProfileRepository.save(entity);
        });
    return new UserProfileResponse(
        profile.getExternalId(),
        profile.getFullName(),
        profile.getEmail(),
        profile.getPhoneNumber(),
        profile.getLocation(),
        profile.getCity(),
        profile.getStateName(),
        profile.getPostalCode(),
        profile.getEmergencyContactName(),
        profile.getEmergencyContactPhone(),
        profile.getPhotoUrl());
  }

  public UserProfileResponse updateProfile(UpdateProfileRequest request) {
    UserProfileEntity profile = userProfileRepository.findByExternalId("demo-user")
        .orElseGet(() -> {
          UserProfileEntity entity = new UserProfileEntity();
          entity.setExternalId("demo-user");
          entity.setFullName("Your Name");
          entity.setEmail("yourname@example.com");
          entity.setPhoneNumber("+91-9876543210");
          entity.setLocation("Your area, your city, your state");
          entity.setCity("Your City");
          entity.setStateName("Your State");
          entity.setPostalCode("000000");
          entity.setEmergencyContactName("Emergency Contact");
          entity.setEmergencyContactPhone("+91-9876543211");
          entity.setPhotoUrl("https://picsum.photos/seed/travel-buddy-profile/300/300");
          return entity;
        });

    profile.setFullName(request.fullName());
    profile.setEmail(request.email());
    profile.setPhoneNumber(request.phoneNumber());
    profile.setLocation(request.location());
    profile.setCity(request.city());
    profile.setStateName(request.stateName());
    profile.setPostalCode(request.postalCode());
    profile.setEmergencyContactName(request.emergencyContactName());
    profile.setEmergencyContactPhone(request.emergencyContactPhone());
    profile.setPhotoUrl(request.photoUrl());
    UserProfileEntity saved = userProfileRepository.save(profile);

    return new UserProfileResponse(
        saved.getExternalId(),
        saved.getFullName(),
        saved.getEmail(),
        saved.getPhoneNumber(),
        saved.getLocation(),
        saved.getCity(),
        saved.getStateName(),
        saved.getPostalCode(),
        saved.getEmergencyContactName(),
        saved.getEmergencyContactPhone(),
        saved.getPhotoUrl());
  }

  private void persistTrip(PersonalizedTripRequest request, PersonalizedTripResponse response) {
    try {
      TripRequestEntity entity = new TripRequestEntity();
      entity.setUserExternalId("demo-user");
      entity.setCurrentLocation(request.currentLocation());
      entity.setDestination(request.location());
      entity.setStartDate(LocalDate.parse(request.startDate()));
      entity.setEndDate(LocalDate.parse(request.endDate()));
      entity.setBudgetInr(request.budget());
      entity.setTravelers(request.numberOfPeople());
      entity.setInterests(request.interests());
      entity.setSuitabilityScore(response.suitabilityScore());
      tripRequestRepository.save(entity);
    } catch (Exception ignored) {
      // Avoid failing the API response when persistence is temporarily unavailable.
    }
  }

  private List<PlaceResult> mockPlaces(String query, String location) {
    String city = cityOnly(location);
    String normalized = query.toLowerCase(Locale.ENGLISH);

    return List.of(
            new PlaceResult(
                1,
                city + " Heritage Walk",
                "Old City, " + city,
                4.7,
                1284,
                "attraction",
                "https://picsum.photos/seed/" + seed(city + "heritage") + "/600/400"),
            new PlaceResult(
                2,
                city + " Spice Route Kitchen",
                "Central Market, " + city,
                4.5,
                982,
                normalized.contains("restaurant") || normalized.contains("cafe") ? "restaurant" : "cafe",
                "https://picsum.photos/seed/" + seed(city + "food") + "/600/400"),
            new PlaceResult(
                3,
                city + " Sunset Point",
                "Scenic Ridge, " + city,
                4.6,
                643,
                "viewpoint",
                "https://picsum.photos/seed/" + seed(city + "sunset") + "/600/400"),
            new PlaceResult(
                4,
                city + " Craft Bazaar",
                "Bazaar Road, " + city,
                4.3,
                514,
                "market",
                "https://picsum.photos/seed/" + seed(city + "bazaar") + "/600/400"))
        .stream()
        .filter(place -> normalized.isBlank()
            || place.title().toLowerCase(Locale.ENGLISH).contains(normalized)
            || place.type().toLowerCase(Locale.ENGLISH).contains(normalized)
            || normalized.equals("cafe")
            || normalized.equals("temples")
            || normalized.equals("attractions"))
        .toList();
  }

  private RoutePlan mockRoute(String origin, String destination, String mode) {
    long distanceKm = Math.max(120, (origin.length() + destination.length()) * 11L);
    double speed = switch (mode) {
      case "WALKING" -> 5.0;
      case "BICYCLING" -> 15.0;
      case "TRANSIT" -> 35.0;
      default -> 55.0;
    };
    long durationHours = Math.max(1, Math.round(distanceKm / speed));
    return new RoutePlan(
        origin,
        destination,
        mode,
        distanceKm + " km",
        durationHours + "h " + Math.max(10, (distanceKm % 55)) + "m",
        List.of(origin, "Midway stop at " + cityOnly(origin) + " Junction", destination));
  }

  private String normalizeMode(String mode) {
    if (mode == null) {
      return "DRIVING";
    }
    return switch (mode.toUpperCase(Locale.ENGLISH)) {
      case "WALKING" -> "WALKING";
      case "BICYCLING" -> "BICYCLING";
      case "TRANSIT", "BUS", "BUSES" -> "TRANSIT";
      default -> "DRIVING";
    };
  }

  private PersonalizedTripResponse mockTrip(PersonalizedTripRequest request) {
    LocalDate start = LocalDate.parse(request.startDate());
    LocalDate end = LocalDate.parse(request.endDate());
    long days = Math.max(1, ChronoUnit.DAYS.between(start, end) + 1);
    int score = computeSuitabilityScore(request.budget(), request.interests(), days);
    int accommodation = (int) Math.min(request.budget() * 0.38, days * 3800 * request.numberOfPeople());
    int food = (int) Math.min(request.budget() * 0.18, days * 900 * request.numberOfPeople());
    int transport = (int) Math.min(request.budget() * 0.22, 2500 + days * 1200);
    int activities = Math.max(1500, request.budget() - accommodation - food - transport);
    String city = cityOnly(request.location());

    List<ItineraryDay> itinerary = java.util.stream.IntStream.rangeClosed(1, (int) days)
        .mapToObj(day -> new ItineraryDay(
            day,
            dayTitle(day, city),
            List.of(
                "Breakfast at a highly rated local spot in " + city,
                interestActivity(request.interests(), city, day),
                "Transparent spend check: compare actual costs vs planned budget",
                "Evening leisure and photo stop in a popular neighborhood")))
        .toList();

    return new PersonalizedTripResponse(
        city + " Smart Escape",
        score,
        score >= 8
            ? "Excellent match for your stated budget, trip length, and interests."
            : "Moderate fit. The plan works, but your budget or timing may require trade-offs.",
        "A decision-focused " + days + "-day plan for " + city
            + " with transparent costs, weather-aware packing advice, and a realistic pace for "
            + request.numberOfPeople() + " traveler(s).",
        new BudgetBreakdown(
            "INR " + accommodation,
            "INR " + food,
            "INR " + transport,
            "INR " + activities,
            "INR " + (accommodation + food + transport + activities)),
        weather(city, start.getMonthValue()),
        itinerary);
  }

  private JsonNode searchApiRequest(Map<String, String> params) throws Exception {
    StringBuilder url = new StringBuilder("https://www.searchapi.io/api/v1/search?");
    for (Map.Entry<String, String> entry : params.entrySet()) {
      if (url.charAt(url.length() - 1) != '?') {
        url.append('&');
      }
      url.append(URLEncoder.encode(entry.getKey(), StandardCharsets.UTF_8));
      url.append('=');
      url.append(URLEncoder.encode(entry.getValue(), StandardCharsets.UTF_8));
    }
    url.append("&api_key=").append(URLEncoder.encode(searchApiKey, StandardCharsets.UTF_8));
    String body = restClient.get().uri(url.toString()).retrieve().body(String.class);
    return objectMapper.readTree(body);
  }

  private Accommodation rapidHotelDetails(
      String propertyId,
      String location,
      LocalDate checkIn,
      LocalDate checkOut,
      int adults,
      String currency,
      String locale) throws Exception {
    String body = restClient.get()
        .uri("https://hotels4.p.rapidapi.com/properties/get-details?id=" + propertyId
            + "&checkIn=" + checkIn
            + "&checkOut=" + checkOut
            + "&adults1=" + adults
            + "&currency=" + URLEncoder.encode(currency, StandardCharsets.UTF_8)
            + "&locale=" + URLEncoder.encode(locale, StandardCharsets.UTF_8))
        .header("Content-Type", "application/json")
        .header("x-rapidapi-host", "hotels4.p.rapidapi.com")
        .header("x-rapidapi-key", rapidApiKey)
        .retrieve()
        .body(String.class);
    JsonNode root = objectMapper.readTree(body);
    JsonNode data = root.path("data").path("body");

    String name = textValue(data.path("summary"), "name");
    if (name.isBlank()) {
      name = textValue(root, "name", "hotelName");
    }
    String address =
        textValue(data.path("propertyDescription").path("address"), "fullAddress", "addressLine");
    if (address.isBlank()) {
      address = location;
    }
    double rating = data.path("guestReviews").path("brands").path("overall").asDouble(
        data.path("reviewInfo").path("summary").path("overallScore").asDouble(4.2));
    String imageUrl = data.path("propertyGallery").path("images").path(0).path("baseUrl").asText("");
    if (imageUrl.contains("{size}")) {
      imageUrl = imageUrl.replace("{size}", "z");
    }
    if (imageUrl.isBlank()) {
      imageUrl = "https://picsum.photos/seed/" + seed(name + location + propertyId) + "/600/400";
    }
    List<String> amenities = new ArrayList<>();
    JsonNode amenitySections = data.path("overview").path("overviewSections");
    if (amenitySections.isArray()) {
      for (JsonNode section : amenitySections) {
        JsonNode content = section.path("content");
        if (content.isArray()) {
          for (JsonNode item : content) {
            String label = item.asText("");
            if (!label.isBlank()) {
              amenities.add(label);
            }
            if (amenities.size() >= 4) {
              break;
            }
          }
        }
        if (amenities.size() >= 4) {
          break;
        }
      }
    }
    if (amenities.isEmpty()) {
      amenities = List.of("Hotel details", "RapidAPI listing");
    }
    String bookingUrl = "https://www.hotels.com/Hotel-Search?destination=" + URLEncoder.encode(cityOnly(location), StandardCharsets.UTF_8);

    return new Accommodation(
        "rapid-hotel-" + propertyId,
        name.isBlank() ? cityOnly(location) + " Hotel" : name,
        address,
        rating <= 0 ? 4.2 : rating,
        amenities,
        "Check live rate",
        imageUrl,
        "hotel",
        bookingUrl);
  }

  private List<TransportOption> rapidCabLocations(String city) throws Exception {
    String body = restClient.get()
        .uri("https://priceline-com.p.rapidapi.com/cars/location/search?q="
            + URLEncoder.encode(city, StandardCharsets.UTF_8))
        .header("Content-Type", "application/json")
        .header("x-rapidapi-host", "priceline-com.p.rapidapi.com")
        .header("x-rapidapi-key", rapidApiKey)
        .retrieve()
        .body(String.class);
    JsonNode root = objectMapper.readTree(body);
    JsonNode candidates = root.path("results");
    if (!candidates.isArray() || candidates.isEmpty()) {
      candidates = root.path("data");
    }
    List<TransportOption> options = new ArrayList<>();
    if (candidates.isArray()) {
      for (JsonNode node : candidates) {
        String locationName = textValue(node, "name", "displayName", "cityName", "address");
        String code = textValue(node, "id", "cityCode", "code");
        if (locationName.isBlank()) {
          continue;
        }
        options.add(new TransportOption(
            "rapid-cab-" + (code.isBlank() ? seed(locationName) : code),
            "Live cabs near " + locationName,
            locationName,
            "cab",
            "Check live cab rates",
            null,
            true,
            null,
            null,
            null,
            null,
            null,
            null,
            4.3,
            null,
            "RapidAPI location match for cab booking"));
        if (options.size() >= 5) {
          break;
        }
      }
    }
    return options;
  }

  private String rapidHotelPropertyIdFor(String location) {
    String normalized = location.toLowerCase(Locale.ENGLISH);
    if (normalized.contains("delhi")) {
      return "424023";
    }
    return "";
  }

  private String geminiText(String model, String prompt) throws Exception {
    JsonNode response = geminiRequest(model, Map.of(
        "contents", List.of(Map.of(
            "parts", List.of(Map.of("text", prompt))))));
    return extractGeminiText(response);
  }

  private String geminiImage(String prompt) throws Exception {
    JsonNode response = geminiRequest("gemini-2.5-flash-image", Map.of(
        "contents", List.of(Map.of(
            "parts", List.of(Map.of("text", prompt)))),
        "generationConfig", Map.of(
            "responseModalities", List.of("TEXT", "IMAGE"))));

    JsonNode parts = response.path("candidates").path(0).path("content").path("parts");
    if (parts.isArray()) {
      for (JsonNode part : parts) {
        JsonNode inline = part.has("inline_data") ? part.path("inline_data") : part.path("inlineData");
        String data = textValue(inline, "data");
        String mime = textValue(inline, "mime_type", "mimeType");
        if (!data.isBlank() && !mime.isBlank()) {
          return "data:" + mime + ";base64," + data;
        }
      }
    }
    return "";
  }

  private JsonNode geminiRequest(String model, Map<String, Object> payload) throws Exception {
    String response = restClient.post()
        .uri("https://generativelanguage.googleapis.com/v1beta/models/" + model + ":generateContent")
        .header("x-goog-api-key", geminiApiKey)
        .header("Content-Type", "application/json")
        .body(objectMapper.writeValueAsString(payload))
        .retrieve()
        .body(String.class);
    return objectMapper.readTree(response);
  }

  private String extractGeminiText(JsonNode response) {
    JsonNode parts = response.path("candidates").path(0).path("content").path("parts");
    if (!parts.isArray()) {
      return "";
    }
    StringBuilder text = new StringBuilder();
    for (JsonNode part : parts) {
      if (part.has("text")) {
        text.append(part.path("text").asText());
      }
    }
    return text.toString().trim();
  }

  private String extractJson(String raw) {
    String cleaned = raw.replace("```json", "```");
    int firstBrace = cleaned.indexOf('{');
    int lastBrace = cleaned.lastIndexOf('}');
    if (firstBrace >= 0 && lastBrace > firstBrace) {
      return cleaned.substring(firstBrace, lastBrace + 1);
    }
    return raw;
  }

  private int computeSuitabilityScore(int budget, String interests, long days) {
    int base = budget >= 30000 ? 8 : budget >= 15000 ? 7 : 6;
    if (interests.toLowerCase(Locale.ENGLISH).contains("luxury")) {
      base -= 1;
    }
    if (days > 6) {
      base -= 1;
    }
    return Math.max(0, Math.min(10, base));
  }

  private String weather(String city, int month) {
    if (month >= 6 && month <= 9) {
      return city + " may see monsoon conditions. Pack a light rain jacket, quick-dry footwear, and a waterproof day bag.";
    }
    if (month >= 11 || month <= 2) {
      return city + " can be cool in mornings and evenings. Carry light layers, comfortable walking shoes, and sunscreen.";
    }
    return city + " is likely to be warm during the day. Pack breathable cotton clothing, sunglasses, and refillable water bottles.";
  }

  private String interestActivity(String interests, String city, int day) {
    String normalized = interests.toLowerCase(Locale.ENGLISH);
    if (normalized.contains("food")) {
      return "Curated food trail across " + city + " with regional specialties and street-food safety tips";
    }
    if (normalized.contains("culture")) {
      return "Guided heritage and culture circuit through key landmarks in " + city;
    }
    if (normalized.contains("nature") || normalized.contains("hiking")) {
      return "Nature-focused excursion near " + city + " with sunrise and scenic viewpoints";
    }
    return "Flexible discovery day " + day + " built around top-rated attractions in " + city;
  }

  private String dayTitle(int day, String city) {
    if (day == 1) {
      return "Arrival and orientation in " + city;
    }
    if (day == 2) {
      return "Signature experiences";
    }
    return "Local depth and relaxed exploration";
  }

  private String cityOnly(String value) {
    return value == null ? "" : value.split(",")[0].trim();
  }

  private String textValue(JsonNode node, String... keys) {
    for (String key : keys) {
      JsonNode value = node.path(key);
      if (!value.isMissingNode() && !value.isNull()) {
        if (value.isTextual()) {
          return value.asText();
        }
        if (value.isArray() && !value.isEmpty()) {
          JsonNode first = value.get(0);
          if (first.isTextual()) {
            return first.asText();
          }
        }
      }
    }
    return "";
  }

  private int seed(String value) {
    return Math.abs(value.hashCode());
  }

  private boolean hasGeminiKey() {
    return !geminiApiKey.isBlank();
  }

  private boolean hasSearchApiKey() {
    return !searchApiKey.isBlank();
  }

  private boolean hasRapidApiKey() {
    return !rapidApiKey.isBlank();
  }

  public record PersonalizedTripRequest(
      String currentLocation,
      String location,
      String startDate,
      String endDate,
      int budget,
      int numberOfPeople,
      String interests) {}

  public record PersonalizedTripResponse(
      String tripTitle,
      int suitabilityScore,
      String suitabilityReasoning,
      String tripSummary,
      BudgetBreakdown budgetBreakdown,
      String weatherAdvisory,
      List<ItineraryDay> dailyItinerary) {}

  public record BudgetBreakdown(
      String accommodation,
      String food,
      String transport,
      String activities,
      String total) {}

  public record ItineraryDay(
      int day,
      String title,
      List<String> activities) {}

  public record PlaceResult(
      int position,
      String title,
      String address,
      double rating,
      int reviews,
      String type,
      String thumbnail) {}

  public record PosterResponse(
      String title,
      String imageUrl) {}

  public record TransportOption(
      String id,
      String name,
      String location,
      String serviceType,
      String price,
      String contact,
      boolean verified,
      String vehicleClass,
      String from,
      String to,
      String departureTime,
      String arrivalTime,
      String duration,
      Double rating,
      String bookingUrl,
      String notes) {}

  public record BookingRequest(
      String serviceType,
      String details) {}

  public record BookingResponse(
      String bookingId,
      String message) {}

  public record Accommodation(
      String id,
      String name,
      String location,
      double rating,
      List<String> amenities,
      String price,
      String imageUrl,
      String category,
      String bookingUrl) {}

  public record RoutePlan(
      String origin,
      String destination,
      String mode,
      String distance,
      String duration,
      List<String> waypoints) {}

  public record ChatRequest(String question) {}

  public record ChatResponse(String answer) {}

  public record FlightWebhookRequest(
      String flightNumber,
      String url,
      boolean useCredits) {}

  public record FlightWebhookResponse(
      String status,
      String message) {}

  public record AvatarRequest(String prompt) {}

  public record AvatarResponse(String imageUrl) {}

  public record UpdateProfileRequest(
      String fullName,
      String email,
      String phoneNumber,
      String location,
      String city,
      String stateName,
      String postalCode,
      String emergencyContactName,
      String emergencyContactPhone,
      String photoUrl) {}

  public record UserProfileResponse(
      String id,
      String fullName,
      String email,
      String phoneNumber,
      String location,
      String city,
      String stateName,
      String postalCode,
      String emergencyContactName,
      String emergencyContactPhone,
      String photoUrl) {}
}
