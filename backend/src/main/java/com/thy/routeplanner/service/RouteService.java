package com.thy.routeplanner.service;

import com.thy.routeplanner.dto.response.LocationResponse;
import com.thy.routeplanner.dto.response.RouteResponse;
import com.thy.routeplanner.entity.Transportation;
import com.thy.routeplanner.enums.TransportationType;
import com.thy.routeplanner.repository.TransportationRepository;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Service
public class RouteService {

    private final TransportationRepository transportationRepository;
    private final LocationService locationService;

    public RouteService(TransportationRepository transportationRepository,
                        LocationService locationService) {
        this.transportationRepository = transportationRepository;
        this.locationService = locationService;
    }

    @Cacheable(value = "routes", key = "#originId + '-' + #destinationId + '-' + #date")
    public List<RouteResponse> findRoutes(Long originId, Long destinationId, LocalDate date) {
        if (originId.equals(destinationId)) {
            throw new IllegalArgumentException("Origin and destination locations must be different");
        }

        locationService.findEntityById(originId);
        locationService.findEntityById(destinationId);

        int dayOfWeek = date.getDayOfWeek().getValue();
        List<RouteResponse> routes = new ArrayList<>();

        List<Transportation> flights = findFlightsOperatingOnDay(dayOfWeek);

        for (Transportation flight : flights) {
            findDirectFlightRoutes(flight, originId, destinationId, routes);
            findPreTransferRoutes(flight, originId, destinationId, dayOfWeek, routes);
            findPostTransferRoutes(flight, originId, destinationId, dayOfWeek, routes);
            findFullTransferRoutes(flight, originId, destinationId, dayOfWeek, routes);
        }

        return routes;
    }

    private List<Transportation> findFlightsOperatingOnDay(int dayOfWeek) {
        return transportationRepository.findByTypeAndOperatingDaysContaining(TransportationType.FLIGHT, dayOfWeek);
    }

    private void findDirectFlightRoutes(Transportation flight, Long originId, Long destinationId,
                                         List<RouteResponse> routes) {
        boolean originMatches = flight.getOriginLocation().getId().equals(originId);
        boolean destinationMatches = flight.getDestinationLocation().getId().equals(destinationId);

        if (originMatches && destinationMatches) {
            routes.add(buildRoute(List.of(flight)));
        }
    }

    private void findPreTransferRoutes(Transportation flight, Long originId, Long destinationId,
                                        int dayOfWeek, List<RouteResponse> routes) {
        if (!flight.getDestinationLocation().getId().equals(destinationId)) {
            return;
        }

        Long flightOriginId = flight.getOriginLocation().getId();
        List<Transportation> preTransfers = findNonFlightTransfersFromOrigin(originId, dayOfWeek);

        for (Transportation pre : preTransfers) {
            if (pre.getDestinationLocation().getId().equals(flightOriginId)) {
                routes.add(buildRoute(List.of(pre, flight)));
            }
        }
    }

    private void findPostTransferRoutes(Transportation flight, Long originId, Long destinationId,
                                         int dayOfWeek, List<RouteResponse> routes) {
        if (!flight.getOriginLocation().getId().equals(originId)) {
            return;
        }

        Long flightDestId = flight.getDestinationLocation().getId();
        List<Transportation> postTransfers = findNonFlightTransfersToDestination(destinationId, dayOfWeek);

        for (Transportation post : postTransfers) {
            if (post.getOriginLocation().getId().equals(flightDestId)) {
                routes.add(buildRoute(List.of(flight, post)));
            }
        }
    }

    private void findFullTransferRoutes(Transportation flight, Long originId, Long destinationId,
                                         int dayOfWeek, List<RouteResponse> routes) {
        Long flightOriginId = flight.getOriginLocation().getId();
        Long flightDestId = flight.getDestinationLocation().getId();

        List<Transportation> preTransfers = findNonFlightTransfersFromOrigin(originId, dayOfWeek);
        List<Transportation> postTransfers = findNonFlightTransfersToDestination(destinationId, dayOfWeek);

        for (Transportation pre : preTransfers) {
            if (!pre.getDestinationLocation().getId().equals(flightOriginId)) {
                continue;
            }
            for (Transportation post : postTransfers) {
                if (post.getOriginLocation().getId().equals(flightDestId)) {
                    routes.add(buildRoute(List.of(pre, flight, post)));
                }
            }
        }
    }

    private List<Transportation> findNonFlightTransfersFromOrigin(Long originId, int dayOfWeek) {
        return transportationRepository.findByOriginLocationIdAndOperatingDaysContaining(originId, dayOfWeek)
                .stream()
                .filter(t -> t.getType() != TransportationType.FLIGHT)
                .toList();
    }

    private List<Transportation> findNonFlightTransfersToDestination(Long destinationId, int dayOfWeek) {
        return transportationRepository.findByDestinationLocationIdAndOperatingDaysContaining(destinationId, dayOfWeek)
                .stream()
                .filter(t -> t.getType() != TransportationType.FLIGHT)
                .toList();
    }

    private RouteResponse buildRoute(List<Transportation> legs) {
        List<RouteResponse.RouteLeg> routeLegs = legs.stream()
                .map(this::toRouteLeg)
                .toList();
        return new RouteResponse(routeLegs);
    }

    private RouteResponse.RouteLeg toRouteLeg(Transportation t) {
        LocationResponse origin = locationService.toResponse(t.getOriginLocation());
        LocationResponse destination = locationService.toResponse(t.getDestinationLocation());
        return new RouteResponse.RouteLeg(origin, destination, t.getType().name());
    }
}
