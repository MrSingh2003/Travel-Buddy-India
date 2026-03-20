package com.travelbuddyindia.backend.controller;

import com.travelbuddyindia.backend.service.MockCatalogService;
import com.travelbuddyindia.backend.service.MockCatalogService.AvatarRequest;
import com.travelbuddyindia.backend.service.MockCatalogService.AvatarResponse;
import com.travelbuddyindia.backend.service.MockCatalogService.UpdateProfileRequest;
import com.travelbuddyindia.backend.service.MockCatalogService.UserProfileResponse;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/profile")
public class ProfileController {

  private final MockCatalogService catalogService;

  public ProfileController(MockCatalogService catalogService) {
    this.catalogService = catalogService;
  }

  @GetMapping
  public UserProfileResponse profile() {
    return catalogService.profile();
  }

  @PutMapping
  public UserProfileResponse updateProfile(@RequestBody UpdateProfileRequest request) {
    return catalogService.updateProfile(request);
  }

  @PostMapping("/avatar")
  public AvatarResponse avatar(@RequestBody AvatarRequest request) {
    return catalogService.avatar(request);
  }
}
