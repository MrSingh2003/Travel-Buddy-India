package com.travelbuddyindia.gateway;

import java.util.Map;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/gateway")
public class GatewayInfoController {

  @GetMapping("/routes")
  public Map<String, Object> routes() {
    return Map.of(
        "gateway", "travel-buddy-gateway",
        "downstreamServices", new String[] {
            "planning-service",
            "discovery-service",
            "profile-service"
        });
  }
}
