package com.thy.routeplanner.controller;

import com.thy.routeplanner.dto.response.RouteResponse;
import com.thy.routeplanner.dto.response.LocationResponse;
import com.thy.routeplanner.service.LocationService;
import com.thy.routeplanner.service.RouteService;
import jakarta.validation.constraints.Positive;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.List;

@RestController
@Validated
@RequestMapping("/api/routes")
public class RouteController {

    private final RouteService routeService;
    private final LocationService locationService;

    public RouteController(RouteService routeService, LocationService locationService) {
        this.routeService = routeService;
        this.locationService = locationService;
    }

    @GetMapping("/locations")
    public ResponseEntity<List<LocationResponse>> getRouteLocations() {
        return ResponseEntity.ok(locationService.findAll());
    }

    @GetMapping
    public ResponseEntity<List<RouteResponse>> findRoutes(
            @RequestParam @Positive Long originId,
            @RequestParam @Positive Long destinationId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return ResponseEntity.ok(routeService.findRoutes(originId, destinationId, date));
    }
}
