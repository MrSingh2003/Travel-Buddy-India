package com.travelbuddyindia.backend.controller;

import com.travelbuddyindia.backend.service.SupportService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/support")
public class SupportController {

  private final SupportService supportService;

  public SupportController(SupportService supportService) {
    this.supportService = supportService;
  }

  @GetMapping
  public ResponseEntity<List<SupportService.SupportSummary>> listSupportMessages() {
    return ResponseEntity.ok(supportService.listMessages());
  }

  @PostMapping
  public ResponseEntity<SupportService.SupportResponse> submitSupport(
      @Valid @RequestBody SupportService.SupportRequest request,
      HttpServletRequest httpServletRequest) {

    // Basic best-effort IP capture (works with reverse proxies when X-Forwarded-For is present).
    String xForwardedFor = httpServletRequest.getHeader("X-Forwarded-For");
    String ipAddress =
        (xForwardedFor != null && !xForwardedFor.isBlank())
            ? xForwardedFor.split(",")[0].trim()
            : httpServletRequest.getRemoteAddr();

    String userAgent = httpServletRequest.getHeader("User-Agent");

    SupportService.SupportResponse response =
        supportService.submit(request, ipAddress, userAgent);
    return ResponseEntity.ok(response);
  }
}
