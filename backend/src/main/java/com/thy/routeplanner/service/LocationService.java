package com.thy.routeplanner.service;

import com.thy.routeplanner.dto.request.LocationRequest;
import com.thy.routeplanner.dto.response.LocationResponse;
import com.thy.routeplanner.entity.Location;
import com.thy.routeplanner.exception.ResourceNotFoundException;
import com.thy.routeplanner.mapper.LocationMapper;
import com.thy.routeplanner.repository.LocationRepository;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class LocationService {

    private final LocationRepository locationRepository;
    private final LocationMapper locationMapper;

    public LocationService(LocationRepository locationRepository, LocationMapper locationMapper) {
        this.locationRepository = locationRepository;
        this.locationMapper = locationMapper;
    }

    public List<LocationResponse> findAll() {
        return locationRepository.findAll().stream()
                .map(locationMapper::toResponse)
                .toList();
    }

    public LocationResponse findById(Long id) {
        return locationMapper.toResponse(findEntityById(id));
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
        return locationMapper.toResponse(locationRepository.save(location));
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
        return locationMapper.toResponse(locationRepository.save(location));
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
}
