package com.travelbuddyindia.backend.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import java.time.LocalDateTime;

@Entity
@Table(name = "bookings")
public class BookingEntity {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(name = "booking_code", nullable = false, unique = true)
  private String bookingCode;

  @Column(name = "service_type", nullable = false)
  private String serviceType;

  @Column(name = "service_name", nullable = false)
  private String serviceName;

  @Column(name = "booking_status", nullable = false)
  private String bookingStatus;

  @Column(name = "customer_reference")
  private String customerReference;

  @Column(name = "created_at", nullable = false)
  private LocalDateTime createdAt;

  @PrePersist
  void onCreate() {
    createdAt = LocalDateTime.now();
  }

  public Long getId() { return id; }
  public void setId(Long id) { this.id = id; }
  public String getBookingCode() { return bookingCode; }
  public void setBookingCode(String bookingCode) { this.bookingCode = bookingCode; }
  public String getServiceType() { return serviceType; }
  public void setServiceType(String serviceType) { this.serviceType = serviceType; }
  public String getServiceName() { return serviceName; }
  public void setServiceName(String serviceName) { this.serviceName = serviceName; }
  public String getBookingStatus() { return bookingStatus; }
  public void setBookingStatus(String bookingStatus) { this.bookingStatus = bookingStatus; }
  public String getCustomerReference() { return customerReference; }
  public void setCustomerReference(String customerReference) { this.customerReference = customerReference; }
  public LocalDateTime getCreatedAt() { return createdAt; }
  public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
