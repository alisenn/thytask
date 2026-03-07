package com.thy.routeplanner.dto.response;

public record LocationResponse(
        Long id,
        String name,
        String country,
        String city,
        String locationCode,
        Double latitude,
        Double longitude
) {}
