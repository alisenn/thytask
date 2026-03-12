package com.thy.routeplanner.dto.request;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record LocationRequest(
        @NotBlank @Size(max = 100) String name,
        @NotBlank @Size(max = 100) String country,
        @NotBlank @Size(max = 100) String city,
        @NotBlank
        @Size(min = 3, max = 10)
        @Pattern(regexp = "^[A-Z0-9]+$", message = "must contain only uppercase letters and numbers")
        String locationCode,
        @NotNull @DecimalMin("-90.0") @DecimalMax("90.0") Double latitude,
        @NotNull @DecimalMin("-180.0") @DecimalMax("180.0") Double longitude
) {}
