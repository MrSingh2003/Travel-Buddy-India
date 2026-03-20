package com.travelbuddyindia.backend.repository;

import com.travelbuddyindia.backend.model.UserProfileEntity;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserProfileRepository extends JpaRepository<UserProfileEntity, Long> {
  Optional<UserProfileEntity> findByExternalId(String externalId);
}
