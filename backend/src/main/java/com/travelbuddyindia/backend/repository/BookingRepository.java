package com.travelbuddyindia.backend.repository;

import com.travelbuddyindia.backend.model.BookingEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BookingRepository extends JpaRepository<BookingEntity, Long> {
}
