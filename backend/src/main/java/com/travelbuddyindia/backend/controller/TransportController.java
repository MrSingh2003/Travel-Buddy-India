package com.travelbuddyindia.backend.controller;

import com.travelbuddyindia.backend.service.MockCatalogService;
import com.travelbuddyindia.backend.service.MockCatalogService.BookingRequest;
import com.travelbuddyindia.backend.service.MockCatalogService.BookingResponse;
import com.travelbuddyindia.backend.service.MockCatalogService.TransportOption;
import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/transport")
public class TransportController {

  private final MockCatalogService catalogService;

  public TransportController(MockCatalogService catalogService) {
    this.catalogService = catalogService;
  }

  @GetMapping("/cabs")
  public List<TransportOption> cabs(@RequestParam String location) {
    return catalogService.cabs(location);
  }

  @GetMapping("/buses")
  public List<TransportOption> buses(@RequestParam String from, @RequestParam String to) {
    return catalogService.buses(from, to);
  }

  @GetMapping("/trains")
  public List<TransportOption> trains(@RequestParam String from, @RequestParam String to) {
    return catalogService.trains(from, to);
  }

  @PostMapping("/book")
  public BookingResponse book(@RequestBody BookingRequest request) {
    return catalogService.book(request);
  }
}
