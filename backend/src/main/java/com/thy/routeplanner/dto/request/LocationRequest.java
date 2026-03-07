package com.thy.routeplanner.dto.request;

import jakarta.validation.constraints.NotBlank;

public record LocationRequest(
        @NotBlank String name,
        @NotBlank String country,
        @NotBlank String city,
        @NotBlank String locationCode,
        Double latitude,
        Double longitude
) {}
