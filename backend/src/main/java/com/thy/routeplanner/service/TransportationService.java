package com.thy.routeplanner.service;

import com.thy.routeplanner.dto.request.TransportationRequest;
import com.thy.routeplanner.dto.response.TransportationResponse;
import com.thy.routeplanner.entity.Location;
import com.thy.routeplanner.entity.Transportation;
import com.thy.routeplanner.exception.ResourceNotFoundException;
import com.thy.routeplanner.repository.TransportationRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class TransportationService {

    private final TransportationRepository transportationRepository;
    private final LocationService locationService;

    public TransportationService(TransportationRepository transportationRepository,
                                  LocationService locationService) {
        this.transportationRepository = transportationRepository;
        this.locationService = locationService;
    }

    public List<TransportationResponse> findAll() {
        return transportationRepository.findAll().stream()
                .map(this::toResponse)
                .toList();
    }

    public TransportationResponse findById(Long id) {
        return toResponse(findEntityById(id));
    }

    public TransportationResponse create(TransportationRequest request) {
        Location origin = locationService.findEntityById(request.originLocationId());
        Location destination = locationService.findEntityById(request.destinationLocationId());

        Transportation transportation = new Transportation();
        transportation.setOriginLocation(origin);
        transportation.setDestinationLocation(destination);
        transportation.setType(request.type());
        transportation.setOperatingDays(request.operatingDays());

        return toResponse(transportationRepository.save(transportation));
    }

    public TransportationResponse update(Long id, TransportationRequest request) {
        Transportation transportation = findEntityById(id);
        Location origin = locationService.findEntityById(request.originLocationId());
        Location destination = locationService.findEntityById(request.destinationLocationId());

        transportation.setOriginLocation(origin);
        transportation.setDestinationLocation(destination);
        transportation.setType(request.type());
        transportation.setOperatingDays(request.operatingDays());

        return toResponse(transportationRepository.save(transportation));
    }

    public void delete(Long id) {
        Transportation transportation = findEntityById(id);
        transportationRepository.delete(transportation);
    }

    private Transportation findEntityById(Long id) {
        return transportationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Transportation not found with id: " + id));
    }

    private TransportationResponse toResponse(Transportation t) {
        return new TransportationResponse(
                t.getId(),
                locationService.toResponse(t.getOriginLocation()),
                locationService.toResponse(t.getDestinationLocation()),
                t.getType(),
                t.getOperatingDays()
        );
    }
}
