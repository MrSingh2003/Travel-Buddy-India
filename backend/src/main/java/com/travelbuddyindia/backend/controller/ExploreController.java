package com.travelbuddyindia.backend.controller;

import com.travelbuddyindia.backend.service.MockCatalogService;
import com.travelbuddyindia.backend.service.MockCatalogService.PlaceResult;
import com.travelbuddyindia.backend.service.MockCatalogService.PosterResponse;
import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/explore")
public class ExploreController {

  private final MockCatalogService catalogService;

  public ExploreController(MockCatalogService catalogService) {
    this.catalogService = catalogService;
  }

  @GetMapping("/places")
  public List<PlaceResult> searchPlaces(
      @RequestParam String query,
      @RequestParam String location) {
    return catalogService.searchPlaces(query, location);
  }

  @GetMapping("/poster")
  public PosterResponse poster(
      @RequestParam String location,
      @RequestParam(defaultValue = "travel") String query) {
    return catalogService.poster(location.split(",")[0].trim(), query);
  }
}
