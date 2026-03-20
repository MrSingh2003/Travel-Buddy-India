package com.travelbuddyindia.planning;

import java.util.List;
import java.util.Map;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/planning")
public class PlanningController {

  @GetMapping("/capabilities")
  public Map<String, Object> capabilities() {
    return Map.of(
        "service", "planning-service",
        "features", List.of("trip-planning", "suitability-scoring", "chat-assistant", "image-prompting"));
  }
}
