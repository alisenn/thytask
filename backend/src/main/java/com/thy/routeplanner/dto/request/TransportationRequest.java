package com.thy.routeplanner.dto.request;

import com.thy.routeplanner.enums.TransportationType;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

import java.util.Set;

public record TransportationRequest(
        @NotNull @Positive Long originLocationId,
        @NotNull @Positive Long destinationLocationId,
        @NotNull TransportationType type,
        @NotEmpty
        @Size(max = 7)
        Set<@NotNull @Min(1) @Max(7) Integer> operatingDays
) {}
