package com.thy.routeplanner.mapper;

import com.thy.routeplanner.dto.response.LocationResponse;
import com.thy.routeplanner.entity.Location;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface LocationMapper {
    LocationResponse toResponse(Location location);
}
