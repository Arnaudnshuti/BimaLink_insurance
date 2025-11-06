package Backend.bimalink.controller;

import Backend.bimalink.entity.User;
import Backend.bimalink.repository.UserRepository;
import Backend.bimalink.service.JwtService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Integration tests for PolicyController using MockMVC
 */
@SpringBootTest
@AutoConfigureMockMvc
class PolicyControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private JwtService jwtService;

    @Autowired
    private UserRepository userRepository;

    @Test
    void testUnauthenticatedAccess() throws Exception {
        mockMvc.perform(get("/api/v1/policies"))
            .andExpect(status().isUnauthorized());
    }

    @Test
    void testAuthenticatedAccess() throws Exception {
        // Create test user and generate token
        User user = User.builder()
            .username("testuser")
            .email("test@example.com")
            .password("$2a$10$encoded")
            .role("ROLE_ADMIN")
            .enabled(true)
            .build();

        userRepository.save(user);
        String token = jwtService.generateToken(user.getUsername(), user.getRole());

        mockMvc.perform(get("/api/v1/policies")
            .header("Authorization", "Bearer " + token))
            .andExpect(status().isOk()); // or whatever status the endpoint returns
    }

    @Test
    void testAdminRoleRequired() throws Exception {
        User agentUser = User.builder()
            .username("agent")
            .email("agent@example.com")
            .password("$2a$10$encoded")
            .role("ROLE_AGENT")
            .enabled(true)
            .build();

        userRepository.save(agentUser);
        String token = jwtService.generateToken(agentUser.getUsername(), agentUser.getRole());

        // Try to access admin-only endpoint
        mockMvc.perform(get("/api/v1/reports/daily")
            .header("Authorization", "Bearer " + token))
            .andExpect(status().isForbidden());
    }
}
