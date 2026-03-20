package com.travelbuddyindia.backend.controller;

import com.travelbuddyindia.backend.service.MockCatalogService;
import com.travelbuddyindia.backend.service.MockCatalogService.Accommodation;
import java.util.List;
import java.util.Locale;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/accommodations")
public class AccommodationController {

  private final MockCatalogService catalogService;

  public AccommodationController(MockCatalogService catalogService) {
    this.catalogService = catalogService;
  }

  @GetMapping
  public List<Accommodation> accommodations(
      @RequestParam String category,
      @RequestParam(defaultValue = "all") String location) {
    List<Accommodation> base = "dharamshala".equalsIgnoreCase(category)
        ? catalogService.dharamshalas()
        : catalogService.hotels();

    if ("all".equalsIgnoreCase(location)) {
      return base;
    }

    String city = location.split(",")[0].trim().toLowerCase(Locale.ENGLISH);
    return base.stream()
        .filter(item -> item.location().toLowerCase(Locale.ENGLISH).contains(city))
        .toList();
  }
}
