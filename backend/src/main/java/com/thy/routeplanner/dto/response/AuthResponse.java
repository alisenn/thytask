package com.thy.routeplanner.dto.response;

public record AuthResponse(
        String token,
        String username,
        String role
) {}
