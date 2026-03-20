package com.travelbuddyindia.backend.repository;

import com.travelbuddyindia.backend.model.TripRequestEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TripRequestRepository extends JpaRepository<TripRequestEntity, Long> {
}
