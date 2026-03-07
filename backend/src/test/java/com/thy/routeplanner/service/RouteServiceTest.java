package com.thy.routeplanner.service;

import com.thy.routeplanner.dto.response.RouteResponse;
import com.thy.routeplanner.dto.response.LocationResponse;
import com.thy.routeplanner.entity.Location;
import com.thy.routeplanner.entity.Transportation;
import com.thy.routeplanner.enums.TransportationType;
import com.thy.routeplanner.repository.TransportationRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.List;
import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class RouteServiceTest {

    @Mock
    private TransportationRepository transportationRepository;

    @Mock
    private LocationService locationService;

    private RouteService routeService;

    private Location istanbul;
    private Location london;
    private Location taksim;
    private Location wembley;

    // Monday = 1
    private static final LocalDate MONDAY_DATE = LocalDate.of(2026, 3, 9);
    // Saturday = 6
    private static final LocalDate SATURDAY_DATE = LocalDate.of(2026, 3, 7);

    @BeforeEach
    void setUp() {
        routeService = new RouteService(transportationRepository, locationService);

        istanbul = createLocation(1L, "Istanbul Airport", "Turkey", "Istanbul", "IST");
        london = createLocation(2L, "London Heathrow", "UK", "London", "LHR");
        taksim = createLocation(3L, "Taksim Square", "Turkey", "Istanbul", "TAK");
        wembley = createLocation(4L, "Wembley Stadium", "UK", "London", "WEM");

        lenient().when(locationService.findEntityById(1L)).thenReturn(istanbul);
        lenient().when(locationService.findEntityById(2L)).thenReturn(london);
        lenient().when(locationService.findEntityById(3L)).thenReturn(taksim);
        lenient().when(locationService.findEntityById(4L)).thenReturn(wembley);
        lenient().when(locationService.toResponse(any(Location.class))).thenAnswer(invocation -> {
            Location location = invocation.getArgument(0);
            return new LocationResponse(
                    location.getId(),
                    location.getName(),
                    location.getCountry(),
                    location.getCity(),
                    location.getLocationCode(),
                    location.getLatitude(),
                    location.getLongitude()
            );
        });
    }

    @Nested
    @DisplayName("Valid Route Tests")
    class ValidRouteTests {

        @Test
        @DisplayName("Direct flight: IST -> LHR")
        void shouldFindDirectFlight() {
            Transportation flight = createTransportation(1L, istanbul, london, TransportationType.FLIGHT, Set.of(1));

            when(transportationRepository.findByTypeAndOperatingDaysContaining(TransportationType.FLIGHT, 1))
                    .thenReturn(List.of(flight));

            List<RouteResponse> routes = routeService.findRoutes(1L, 2L, MONDAY_DATE);

            assertThat(routes).hasSize(1);
            assertThat(routes.get(0).legs()).hasSize(1);
            assertThat(routes.get(0).legs().get(0).transportationType()).isEqualTo("FLIGHT");
        }

        @Test
        @DisplayName("Pre-transfer + flight: UBER(TAK->IST) -> FLIGHT(IST->LHR)")
        void shouldFindPreTransferRoute() {
            Transportation uber = createTransportation(1L, taksim, istanbul, TransportationType.UBER, Set.of(1));
            Transportation flight = createTransportation(2L, istanbul, london, TransportationType.FLIGHT, Set.of(1));

            when(transportationRepository.findByTypeAndOperatingDaysContaining(TransportationType.FLIGHT, 1))
                    .thenReturn(List.of(flight));
            when(transportationRepository.findByOriginLocationIdAndOperatingDaysContaining(3L, 1))
                    .thenReturn(List.of(uber));

            List<RouteResponse> routes = routeService.findRoutes(3L, 2L, MONDAY_DATE);

            assertThat(routes).hasSize(1);
            assertThat(routes.get(0).legs()).hasSize(2);
            assertThat(routes.get(0).legs().get(0).transportationType()).isEqualTo("UBER");
            assertThat(routes.get(0).legs().get(1).transportationType()).isEqualTo("FLIGHT");
        }

        @Test
        @DisplayName("Flight + post-transfer: FLIGHT(IST->LHR) -> BUS(LHR->WEM)")
        void shouldFindPostTransferRoute() {
            Transportation flight = createTransportation(1L, istanbul, london, TransportationType.FLIGHT, Set.of(1));
            Transportation bus = createTransportation(2L, london, wembley, TransportationType.BUS, Set.of(1));

            when(transportationRepository.findByTypeAndOperatingDaysContaining(TransportationType.FLIGHT, 1))
                    .thenReturn(List.of(flight));
            when(transportationRepository.findByDestinationLocationIdAndOperatingDaysContaining(4L, 1))
                    .thenReturn(List.of(bus));

            List<RouteResponse> routes = routeService.findRoutes(1L, 4L, MONDAY_DATE);

            assertThat(routes).hasSize(1);
            assertThat(routes.get(0).legs()).hasSize(2);
            assertThat(routes.get(0).legs().get(0).transportationType()).isEqualTo("FLIGHT");
            assertThat(routes.get(0).legs().get(1).transportationType()).isEqualTo("BUS");
        }

        @Test
        @DisplayName("Full route: UBER(TAK->IST) -> FLIGHT(IST->LHR) -> BUS(LHR->WEM)")
        void shouldFindFullTransferRoute() {
            Transportation uber = createTransportation(1L, taksim, istanbul, TransportationType.UBER, Set.of(1));
            Transportation flight = createTransportation(2L, istanbul, london, TransportationType.FLIGHT, Set.of(1));
            Transportation bus = createTransportation(3L, london, wembley, TransportationType.BUS, Set.of(1));

            when(transportationRepository.findByTypeAndOperatingDaysContaining(TransportationType.FLIGHT, 1))
                    .thenReturn(List.of(flight));
            when(transportationRepository.findByOriginLocationIdAndOperatingDaysContaining(3L, 1))
                    .thenReturn(List.of(uber));
            when(transportationRepository.findByDestinationLocationIdAndOperatingDaysContaining(4L, 1))
                    .thenReturn(List.of(bus));

            List<RouteResponse> routes = routeService.findRoutes(3L, 4L, MONDAY_DATE);

            assertThat(routes).hasSize(1);
            assertThat(routes.get(0).legs()).hasSize(3);
            assertThat(routes.get(0).legs().get(0).transportationType()).isEqualTo("UBER");
            assertThat(routes.get(0).legs().get(1).transportationType()).isEqualTo("FLIGHT");
            assertThat(routes.get(0).legs().get(2).transportationType()).isEqualTo("BUS");
        }
    }

    @Nested
    @DisplayName("Invalid Route Tests")
    class InvalidRouteTests {

        @Test
        @DisplayName("No flight in route: should return empty")
        void shouldReturnEmptyWhenNoFlight() {
            when(transportationRepository.findByTypeAndOperatingDaysContaining(TransportationType.FLIGHT, 1))
                    .thenReturn(List.of());

            List<RouteResponse> routes = routeService.findRoutes(3L, 4L, MONDAY_DATE);

            assertThat(routes).isEmpty();
        }

        @Test
        @DisplayName("No connecting route: should return empty")
        void shouldReturnEmptyWhenNoConnection() {
            Transportation flight = createTransportation(1L, istanbul, london, TransportationType.FLIGHT, Set.of(1));

            when(transportationRepository.findByTypeAndOperatingDaysContaining(TransportationType.FLIGHT, 1))
                    .thenReturn(List.of(flight));

            // Origin=Taksim, Dest=Wembley, but no transfers available
            List<RouteResponse> routes = routeService.findRoutes(3L, 4L, MONDAY_DATE);

            assertThat(routes).isEmpty();
        }
    }

    @Nested
    @DisplayName("Operating Day Tests")
    class OperatingDayTests {

        @Test
        @DisplayName("Flight not operating on selected day: should return empty")
        void shouldReturnEmptyWhenFlightNotOperating() {
            // Flight operates on Monday(1) only
            when(transportationRepository.findByTypeAndOperatingDaysContaining(TransportationType.FLIGHT, 6))
                    .thenReturn(List.of());

            // Search on Saturday(6)
            List<RouteResponse> routes = routeService.findRoutes(1L, 2L, SATURDAY_DATE);

            assertThat(routes).isEmpty();
        }
    }

    private Location createLocation(Long id, String name, String country, String city, String code) {
        Location location = new Location();
        location.setId(id);
        location.setName(name);
        location.setCountry(country);
        location.setCity(city);
        location.setLocationCode(code);
        return location;
    }

    private Transportation createTransportation(Long id, Location origin, Location destination,
                                                 TransportationType type, Set<Integer> days) {
        Transportation t = new Transportation();
        t.setId(id);
        t.setOriginLocation(origin);
        t.setDestinationLocation(destination);
        t.setType(type);
        t.setOperatingDays(days);
        return t;
    }
}
