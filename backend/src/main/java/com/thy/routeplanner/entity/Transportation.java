package com.thy.routeplanner.entity;

import com.thy.routeplanner.enums.TransportationType;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.Set;

@Entity
@Table(name = "transportations")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Transportation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "origin_location_id", nullable = false)
    private Location originLocation;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "destination_location_id", nullable = false)
    private Location destinationLocation;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TransportationType type;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "transportation_operating_days", joinColumns = @JoinColumn(name = "transportation_id"))
    @Column(name = "operating_day")
    private Set<Integer> operatingDays;
}
