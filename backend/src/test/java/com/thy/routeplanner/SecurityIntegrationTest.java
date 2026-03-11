package com.thy.routeplanner;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.thy.routeplanner.entity.Location;
import com.thy.routeplanner.entity.User;
import com.thy.routeplanner.enums.Role;
import com.thy.routeplanner.repository.LocationRepository;
import com.thy.routeplanner.repository.UserRepository;
import com.thy.routeplanner.security.JwtService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class SecurityIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private LocationRepository locationRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtService jwtService;

    private String agencyToken;

    @BeforeEach
    void setUp() {
        userRepository.deleteAll();
        locationRepository.deleteAll();

        User agency = new User();
        agency.setUsername("agency-test");
        agency.setPassword(passwordEncoder.encode("password"));
        agency.setRole(Role.AGENCY);
        userRepository.save(agency);

        agencyToken = jwtService.generateToken(agency.getUsername(), agency.getRole().name());

        locationRepository.save(new Location(null, "Istanbul Airport", "Turkey", "Istanbul", "IST", 41.2753, 28.7180));
        locationRepository.save(new Location(null, "London Heathrow", "UK", "London", "LHR", 51.4700, -0.4543));
    }

    @Test
    void shouldReturn401ForProtectedEndpointWithoutAuthentication() throws Exception {
        mockMvc.perform(get("/api/routes/locations"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.message").value("Authentication required"));
    }

    @Test
    void shouldReturn403WhenAgencyRequestsAdminEndpoint() throws Exception {
        mockMvc.perform(get("/api/locations")
                        .header("Authorization", "Bearer " + agencyToken))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.message").value("Access denied"));
    }

    @Test
    void shouldAllowAgencyToReadRouteLocations() throws Exception {
        mockMvc.perform(get("/api/routes/locations")
                        .header("Authorization", "Bearer " + agencyToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].locationCode").exists());
    }

    @Test
    void shouldRegisterUsersAsAgencyEvenIfRoleIsInjected() throws Exception {
        String responseBody = mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "username", "new-user",
                                "password", "secret",
                                "role", "ADMIN"
                        ))))
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse()
                .getContentAsString();

        Map<?, ?> response = objectMapper.readValue(responseBody, Map.class);
        assertThat(response.get("role")).isEqualTo("AGENCY");
        assertThat(userRepository.findByUsername("new-user")).isPresent();
        assertThat(userRepository.findByUsername("new-user").orElseThrow().getRole()).isEqualTo(Role.AGENCY);
    }

    @Test
    void shouldReturn409WhenUsernameAlreadyExists() throws Exception {
        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "username", "agency-test",
                                "password", "secret123"
                        ))))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.message").value("Username already exists: agency-test"));
    }

    @Test
    void shouldReturn401ForInvalidLoginCredentials() throws Exception {
        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "username", "agency-test",
                                "password", "wrong-password"
                        ))))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.message").value("Invalid username or password"));
    }
}
