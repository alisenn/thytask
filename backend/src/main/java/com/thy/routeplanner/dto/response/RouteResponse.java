package com.thy.routeplanner.dto.response;

import java.util.List;

public record RouteResponse(
        List<RouteLeg> legs
) {
    public record RouteLeg(
            LocationResponse origin,
            LocationResponse destination,
            String transportationType
    ) {}
}
