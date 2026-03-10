package com.thy.routeplanner.service;

import com.thy.routeplanner.dto.request.TransportationRequest;
import com.thy.routeplanner.dto.response.TransportationResponse;
import com.thy.routeplanner.entity.Location;
import com.thy.routeplanner.entity.Transportation;
import com.thy.routeplanner.exception.ResourceNotFoundException;
import com.thy.routeplanner.mapper.TransportationMapper;
import com.thy.routeplanner.repository.TransportationRepository;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class TransportationService {

    private final TransportationRepository transportationRepository;
    private final LocationService locationService;
    private final TransportationMapper transportationMapper;

    public TransportationService(TransportationRepository transportationRepository,
                                  LocationService locationService,
                                  TransportationMapper transportationMapper) {
        this.transportationRepository = transportationRepository;
        this.locationService = locationService;
        this.transportationMapper = transportationMapper;
    }

    public List<TransportationResponse> findAll() {
        return transportationRepository.findAll().stream()
                .map(transportationMapper::toResponse)
                .toList();
    }

    public TransportationResponse findById(Long id) {
        return transportationMapper.toResponse(findEntityById(id));
    }

    @CacheEvict(value = "routes", allEntries = true)
    public TransportationResponse create(TransportationRequest request) {
        validateRequest(request);
        Location origin = locationService.findEntityById(request.originLocationId());
        Location destination = locationService.findEntityById(request.destinationLocationId());

        Transportation transportation = new Transportation();
        transportation.setOriginLocation(origin);
        transportation.setDestinationLocation(destination);
        transportation.setType(request.type());
        transportation.setOperatingDays(request.operatingDays());

        return transportationMapper.toResponse(transportationRepository.save(transportation));
    }

    @CacheEvict(value = "routes", allEntries = true)
    public TransportationResponse update(Long id, TransportationRequest request) {
        validateRequest(request);
        Transportation transportation = findEntityById(id);
        Location origin = locationService.findEntityById(request.originLocationId());
        Location destination = locationService.findEntityById(request.destinationLocationId());

        transportation.setOriginLocation(origin);
        transportation.setDestinationLocation(destination);
        transportation.setType(request.type());
        transportation.setOperatingDays(request.operatingDays());

        return transportationMapper.toResponse(transportationRepository.save(transportation));
    }

    @CacheEvict(value = "routes", allEntries = true)
    public void delete(Long id) {
        Transportation transportation = findEntityById(id);
        transportationRepository.delete(transportation);
    }

    private void validateRequest(TransportationRequest request) {
        if (request.originLocationId().equals(request.destinationLocationId())) {
            throw new IllegalArgumentException("Origin and destination locations must be different");
        }

        boolean hasInvalidOperatingDay = request.operatingDays().stream()
                .anyMatch(day -> day == null || day < 1 || day > 7);
        if (hasInvalidOperatingDay) {
            throw new IllegalArgumentException("Operating days must contain values between 1 and 7");
        }
    }

    private Transportation findEntityById(Long id) {
        return transportationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Transportation not found with id: " + id));
    }
}
