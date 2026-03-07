package com.thy.routeplanner.dto.response;

import com.thy.routeplanner.enums.TransportationType;

import java.util.Set;

public record TransportationResponse(
        Long id,
        LocationResponse originLocation,
        LocationResponse destinationLocation,
        TransportationType type,
        Set<Integer> operatingDays
) {}
