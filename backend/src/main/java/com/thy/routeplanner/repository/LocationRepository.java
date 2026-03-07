package com.thy.routeplanner.repository;

import com.thy.routeplanner.entity.Location;
import org.springframework.data.jpa.repository.JpaRepository;

public interface LocationRepository extends JpaRepository<Location, Long> {
}
