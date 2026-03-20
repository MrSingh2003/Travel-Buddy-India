package com.travelbuddyindia.profile;

import java.util.List;
import java.util.Map;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/profile-service")
public class ProfileController {

  @GetMapping("/capabilities")
  public Map<String, Object> capabilities() {
    return Map.of(
        "service", "profile-service",
        "features", List.of("profiles", "avatars", "media-metadata"));
  }
}
