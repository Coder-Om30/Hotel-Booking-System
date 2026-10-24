package com.example.hotelbooking.auth;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
public class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    @DisplayName("Registration succeeds and assigns CUSTOMER role")
    void testRegisterSuccess() throws Exception {
        RegisterRequestDto req = new RegisterRequestDto(
                "Jane Doe",
                "jane.unique." + System.currentTimeMillis() + "@example.com",
                "SecurePassword123!"
        );

        mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.accessToken").isNotEmpty())
                .andExpect(jsonPath("$.user.role").value("CUSTOMER"))
                .andExpect(jsonPath("$.user.fullName").value("Jane Doe"))
                .andExpect(jsonPath("$.user.passwordHash").doesNotExist());
    }

    @Test
    @DisplayName("Duplicate email registration fails with 409 Conflict")
    void testRegisterDuplicateFails() throws Exception {
        String email = "dup." + System.currentTimeMillis() + "@example.com";
        RegisterRequestDto req = new RegisterRequestDto("First User", email, "SecurePassword123!");

        mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated());

        mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.code").value("CONFLICT"));
    }

    @Test
    @DisplayName("Login with valid credentials returns JWT")
    void testLoginSuccess() throws Exception {
        LoginRequestDto req = new LoginRequestDto("customer@example.com", "Password123!");

        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.accessToken").isNotEmpty())
                .andExpect(jsonPath("$.user.email").value("customer@example.com"));
    }

    @Test
    @DisplayName("Login with wrong password fails with 401 Unauthorized")
    void testLoginFailure() throws Exception {
        LoginRequestDto req = new LoginRequestDto("customer@example.com", "WrongPassword!");

        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.code").value("UNAUTHORIZED"));
    }

    @Test
    @DisplayName("Customer cannot access admin endpoints (403 Forbidden)")
    void testCustomerDeniedOnAdminEndpoints() throws Exception {
        // 1. Login as customer
        LoginRequestDto req = new LoginRequestDto("customer@example.com", "Password123!");
        MvcResult result = mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andReturn();

        AuthResponseDto authResponse = objectMapper.readValue(result.getResponse().getContentAsString(), AuthResponseDto.class);

        // 2. Attempt admin access
        mockMvc.perform(get("/api/v1/admin/bookings")
                        .header("Authorization", "Bearer " + authResponse.getAccessToken()))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("Admin can access admin endpoints (200 OK)")
    void testAdminAllowedOnAdminEndpoints() throws Exception {
        // 1. Login as admin
        LoginRequestDto req = new LoginRequestDto("admin@example.com", "Admin123!");
        MvcResult result = mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andReturn();

        AuthResponseDto authResponse = objectMapper.readValue(result.getResponse().getContentAsString(), AuthResponseDto.class);

        // 2. Admin access succeeds
        mockMvc.perform(get("/api/v1/admin/bookings")
                        .header("Authorization", "Bearer " + authResponse.getAccessToken()))
                .andExpect(status().isOk());
    }
}
