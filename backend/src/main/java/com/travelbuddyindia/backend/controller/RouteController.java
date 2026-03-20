package com.travelbuddyindia.backend.controller;

import com.travelbuddyindia.backend.service.MockCatalogService;
import com.travelbuddyindia.backend.service.MockCatalogService.RoutePlan;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/routes")
public class RouteController {

  private final MockCatalogService catalogService;

  public RouteController(MockCatalogService catalogService) {
    this.catalogService = catalogService;
  }

  @GetMapping("/plan")
  public RoutePlan plan(
      @RequestParam String origin,
      @RequestParam String destination,
      @RequestParam(defaultValue = "DRIVING") String mode) {
    return catalogService.planRoute(origin, destination, mode);
  }
}
