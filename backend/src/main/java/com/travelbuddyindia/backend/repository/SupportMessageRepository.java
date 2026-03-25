package com.travelbuddyindia.backend.repository;

import com.travelbuddyindia.backend.model.SupportMessageEntity;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SupportMessageRepository extends JpaRepository<SupportMessageEntity, Long> {

  List<SupportMessageEntity> findAllByOrderByCreatedAtDesc();
}
