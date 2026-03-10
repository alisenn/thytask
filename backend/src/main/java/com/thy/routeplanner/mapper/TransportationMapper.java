package com.thy.routeplanner.mapper;

import com.thy.routeplanner.dto.response.TransportationResponse;
import com.thy.routeplanner.entity.Transportation;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring", uses = {LocationMapper.class})
public interface TransportationMapper {
    
    TransportationResponse toResponse(Transportation transportation);
}
