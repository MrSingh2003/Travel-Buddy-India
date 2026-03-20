package com.travelbuddyindia.discovery;

import java.util.List;
import java.util.Map;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/discovery")
public class DiscoveryController {

  @GetMapping("/capabilities")
  public Map<String, Object> capabilities() {
    return Map.of(
        "service", "discovery-service",
        "features", List.of("places", "transport", "accommodations", "route-summaries"));
  }
}
