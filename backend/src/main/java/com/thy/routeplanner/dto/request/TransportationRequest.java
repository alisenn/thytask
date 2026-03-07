package com.thy.routeplanner.dto.request;

import com.thy.routeplanner.enums.TransportationType;
import jakarta.validation.constraints.NotNull;

import java.util.Set;

public record TransportationRequest(
        @NotNull Long originLocationId,
        @NotNull Long destinationLocationId,
        @NotNull TransportationType type,
        @NotNull Set<Integer> operatingDays
) {}
