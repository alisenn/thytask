package com.thy.routeplanner.repository;

import com.thy.routeplanner.entity.Transportation;
import com.thy.routeplanner.enums.TransportationType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TransportationRepository extends JpaRepository<Transportation, Long> {

    List<Transportation> findByOriginLocationIdAndOperatingDaysContaining(Long originId, int dayOfWeek);

    List<Transportation> findByDestinationLocationIdAndOperatingDaysContaining(Long destinationId, int dayOfWeek);

    List<Transportation> findByTypeAndOperatingDaysContaining(TransportationType type, int dayOfWeek);
}
