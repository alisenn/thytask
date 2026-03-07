package com.thy.routeplanner.service;

import com.thy.routeplanner.dto.request.TransportationRequest;
import com.thy.routeplanner.enums.TransportationType;
import com.thy.routeplanner.repository.TransportationRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Set;

import static org.assertj.core.api.Assertions.assertThatThrownBy;

@ExtendWith(MockitoExtension.class)
class TransportationServiceTest {

    @Mock
    private TransportationRepository transportationRepository;

    @Mock
    private LocationService locationService;

    private TransportationService transportationService;

    @BeforeEach
    void setUp() {
        transportationService = new TransportationService(transportationRepository, locationService);
    }

    @Test
    void shouldRejectSameOriginAndDestination() {
        TransportationRequest request = new TransportationRequest(1L, 1L, TransportationType.BUS, Set.of(1, 2));

        assertThatThrownBy(() -> transportationService.create(request))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("must be different");
    }

    @Test
    void shouldRejectOperatingDaysOutsideRange() {
        TransportationRequest request = new TransportationRequest(1L, 2L, TransportationType.BUS, Set.of(0, 8));

        assertThatThrownBy(() -> transportationService.create(request))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("between 1 and 7");
    }
}
