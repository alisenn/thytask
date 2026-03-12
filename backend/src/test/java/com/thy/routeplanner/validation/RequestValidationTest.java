package com.thy.routeplanner.validation;

import com.thy.routeplanner.dto.request.LocationRequest;
import com.thy.routeplanner.dto.request.TransportationRequest;
import com.thy.routeplanner.enums.TransportationType;
import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validation;
import jakarta.validation.Validator;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;

class RequestValidationTest {

    private static Validator validator;

    @BeforeAll
    static void setUpValidator() {
        validator = Validation.buildDefaultValidatorFactory().getValidator();
    }

    @Test
    void shouldRejectLowercaseOrInvalidLocationCode() {
        LocationRequest request = new LocationRequest(
                "Istanbul Airport",
                "Turkey",
                "Istanbul",
                "ist-1",
                41.2753,
                28.7180
        );

        Set<ConstraintViolation<LocationRequest>> violations = validator.validate(request);

        assertThat(violations)
                .extracting(violation -> violation.getPropertyPath().toString())
                .contains("locationCode");
    }

    @Test
    void shouldRejectOperatingDaysOutsideAllowedRange() {
        TransportationRequest request = new TransportationRequest(
                1L,
                2L,
                TransportationType.BUS,
                Set.of(0, 8)
        );

        Set<ConstraintViolation<TransportationRequest>> violations = validator.validate(request);

        assertThat(violations)
                .extracting(violation -> violation.getPropertyPath().toString())
                .anyMatch(path -> path.contains("operatingDays"));
    }

    @Test
    void shouldRejectMoreThanSevenOperatingDays() {
        TransportationRequest request = new TransportationRequest(
                1L,
                2L,
                TransportationType.BUS,
                Set.of(1, 2, 3, 4, 5, 6, 7, 8)
        );

        Set<ConstraintViolation<TransportationRequest>> violations = validator.validate(request);

        assertThat(violations)
                .extracting(violation -> violation.getPropertyPath().toString())
                .anyMatch(path -> path.contains("operatingDays"));
    }
}
