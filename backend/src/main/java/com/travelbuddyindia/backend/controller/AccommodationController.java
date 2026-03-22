package com.travelbuddyindia.backend.controller;

import com.travelbuddyindia.backend.service.MockCatalogService;
import com.travelbuddyindia.backend.service.MockCatalogService.Accommodation;
import java.time.LocalDate;
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
      @RequestParam(defaultValue = "all") String location,
      @RequestParam(required = false) LocalDate checkIn,
      @RequestParam(required = false) LocalDate checkOut,
      @RequestParam(defaultValue = "1") int adults1,
      @RequestParam(defaultValue = "INR") String currency,
      @RequestParam(defaultValue = "India") String locale) {
    List<Accommodation> base = "dharamshala".equalsIgnoreCase(category)
        ? catalogService.dharamshalas()
        : catalogService.hotels(
            location,
            checkIn == null ? LocalDate.now().plusDays(7) : checkIn,
            checkOut == null ? LocalDate.now().plusDays(9) : checkOut,
            adults1,
            currency,
            locale);

    if ("all".equalsIgnoreCase(location)) {
      return base;
    }

    String city = location.split(",")[0].trim().toLowerCase(Locale.ENGLISH);
    return base.stream()
        .filter(item -> item.location().toLowerCase(Locale.ENGLISH).contains(city))
        .toList();
  }
}
