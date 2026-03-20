package com.travelbuddyindia.backend.controller;

import com.travelbuddyindia.backend.service.MockCatalogService;
import com.travelbuddyindia.backend.service.MockCatalogService.ChatRequest;
import com.travelbuddyindia.backend.service.MockCatalogService.ChatResponse;
import com.travelbuddyindia.backend.service.MockCatalogService.PersonalizedTripRequest;
import com.travelbuddyindia.backend.service.MockCatalogService.PersonalizedTripResponse;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/decision")
public class TravelDecisionController {

  private final MockCatalogService catalogService;

  public TravelDecisionController(MockCatalogService catalogService) {
    this.catalogService = catalogService;
  }

  @PostMapping("/trip")
  public PersonalizedTripResponse generateTrip(@Valid @RequestBody PersonalizedTripRequest request) {
    return catalogService.generateTrip(request);
  }

  @PostMapping("/chat")
  public ChatResponse answerQuestion(@Valid @RequestBody ChatRequest request) {
    return catalogService.answerQuestion(request);
  }
}
