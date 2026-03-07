package com.thy.routeplanner.controller;

import com.thy.routeplanner.dto.request.TransportationRequest;
import com.thy.routeplanner.dto.response.TransportationResponse;
import com.thy.routeplanner.service.TransportationService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/transportations")
public class TransportationController {

    private final TransportationService transportationService;

    public TransportationController(TransportationService transportationService) {
        this.transportationService = transportationService;
    }

    @GetMapping
    public ResponseEntity<List<TransportationResponse>> getAll() {
        return ResponseEntity.ok(transportationService.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<TransportationResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(transportationService.findById(id));
    }

    @PostMapping
    public ResponseEntity<TransportationResponse> create(@Valid @RequestBody TransportationRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(transportationService.create(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<TransportationResponse> update(@PathVariable Long id,
                                                          @Valid @RequestBody TransportationRequest request) {
        return ResponseEntity.ok(transportationService.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        transportationService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
