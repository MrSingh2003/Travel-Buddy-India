package com.travelbuddyindia.backend.controller;

import com.travelbuddyindia.backend.service.MockCatalogService;
import com.travelbuddyindia.backend.service.MockCatalogService.FlightWebhookRequest;
import com.travelbuddyindia.backend.service.MockCatalogService.FlightWebhookResponse;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/flights")
public class FlightController {

  private final MockCatalogService catalogService;

  public FlightController(MockCatalogService catalogService) {
    this.catalogService = catalogService;
  }

  @PostMapping("/webhook")
  public FlightWebhookResponse subscribeWebhook(@RequestBody FlightWebhookRequest request) {
    return catalogService.subscribeFlightWebhook(request);
  }
}
