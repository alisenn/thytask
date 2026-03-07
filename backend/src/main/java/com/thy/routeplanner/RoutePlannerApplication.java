package com.thy.routeplanner;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;

@SpringBootApplication
@EnableCaching
public class RoutePlannerApplication {

    public static void main(String[] args) {
        SpringApplication.run(RoutePlannerApplication.class, args);
    }
}
