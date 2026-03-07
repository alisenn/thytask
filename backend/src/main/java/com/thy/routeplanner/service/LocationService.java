package com.thy.routeplanner.service;

import com.thy.routeplanner.dto.request.LocationRequest;
import com.thy.routeplanner.dto.response.LocationResponse;
import com.thy.routeplanner.entity.Location;
import com.thy.routeplanner.exception.ResourceNotFoundException;
import com.thy.routeplanner.repository.LocationRepository;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class LocationService {

    private final LocationRepository locationRepository;

    public LocationService(LocationRepository locationRepository) {
        this.locationRepository = locationRepository;
    }

    public List<LocationResponse> findAll() {
        return locationRepository.findAll().stream()
                .map(this::toResponse)
                .toList();
    }

    public LocationResponse findById(Long id) {
        return toResponse(findEntityById(id));
    }

    @CacheEvict(value = "routes", allEntries = true)
    public LocationResponse create(LocationRequest request) {
        Location location = new Location();
        location.setName(request.name());
        location.setCountry(request.country());
        location.setCity(request.city());
        location.setLocationCode(request.locationCode());
        location.setLatitude(request.latitude());
        location.setLongitude(request.longitude());
        return toResponse(locationRepository.save(location));
    }

    @CacheEvict(value = "routes", allEntries = true)
    public LocationResponse update(Long id, LocationRequest request) {
        Location location = findEntityById(id);
        location.setName(request.name());
        location.setCountry(request.country());
        location.setCity(request.city());
        location.setLocationCode(request.locationCode());
        location.setLatitude(request.latitude());
        location.setLongitude(request.longitude());
        return toResponse(locationRepository.save(location));
    }

    @CacheEvict(value = "routes", allEntries = true)
    public void delete(Long id) {
        Location location = findEntityById(id);
        locationRepository.delete(location);
    }

    public Location findEntityById(Long id) {
        return locationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Location not found with id: " + id));
    }

    public LocationResponse toResponse(Location location) {
        return new LocationResponse(
                location.getId(),
                location.getName(),
                location.getCountry(),
                location.getCity(),
                location.getLocationCode(),
                location.getLatitude(),
                location.getLongitude()
        );
    }
}
