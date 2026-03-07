package com.thy.routeplanner.dto.request;

import com.thy.routeplanner.enums.Role;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record RegisterRequest(
        @NotBlank String username,
        @NotBlank String password,
        @NotNull Role role
) {}
