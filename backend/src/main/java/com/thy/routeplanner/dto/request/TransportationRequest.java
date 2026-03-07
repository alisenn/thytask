package com.thy.routeplanner.dto.request;

import com.thy.routeplanner.enums.TransportationType;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.util.Set;

public record TransportationRequest(
        @NotNull @Positive Long originLocationId,
        @NotNull @Positive Long destinationLocationId,
        @NotNull TransportationType type,
        @NotEmpty Set<Integer> operatingDays
) {}
