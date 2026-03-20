package com.travelbuddyindia.backend.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "trip_requests")
public class TripRequestEntity {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(name = "user_external_id")
  private String userExternalId;

  @Column(name = "current_location", nullable = false)
  private String currentLocation;

  @Column(name = "destination", nullable = false)
  private String destination;

  @Column(name = "start_date", nullable = false)
  private LocalDate startDate;

  @Column(name = "end_date", nullable = false)
  private LocalDate endDate;

  @Column(name = "budget_inr", nullable = false)
  private Integer budgetInr;

  @Column(name = "travelers", nullable = false)
  private Integer travelers;

  @Column(name = "interests")
  private String interests;

  @Column(name = "suitability_score")
  private Integer suitabilityScore;

  @Column(name = "created_at", nullable = false)
  private LocalDateTime createdAt;

  @PrePersist
  void onCreate() {
    createdAt = LocalDateTime.now();
  }

  public Long getId() { return id; }
  public void setId(Long id) { this.id = id; }
  public String getUserExternalId() { return userExternalId; }
  public void setUserExternalId(String userExternalId) { this.userExternalId = userExternalId; }
  public String getCurrentLocation() { return currentLocation; }
  public void setCurrentLocation(String currentLocation) { this.currentLocation = currentLocation; }
  public String getDestination() { return destination; }
  public void setDestination(String destination) { this.destination = destination; }
  public LocalDate getStartDate() { return startDate; }
  public void setStartDate(LocalDate startDate) { this.startDate = startDate; }
  public LocalDate getEndDate() { return endDate; }
  public void setEndDate(LocalDate endDate) { this.endDate = endDate; }
  public Integer getBudgetInr() { return budgetInr; }
  public void setBudgetInr(Integer budgetInr) { this.budgetInr = budgetInr; }
  public Integer getTravelers() { return travelers; }
  public void setTravelers(Integer travelers) { this.travelers = travelers; }
  public String getInterests() { return interests; }
  public void setInterests(String interests) { this.interests = interests; }
  public Integer getSuitabilityScore() { return suitabilityScore; }
  public void setSuitabilityScore(Integer suitabilityScore) { this.suitabilityScore = suitabilityScore; }
  public LocalDateTime getCreatedAt() { return createdAt; }
  public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
