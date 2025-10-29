package Backend.bimalink.controller;

import Backend.bimalink.dto.*;
import Backend.bimalink.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

/**
 * Authentication Controller
 * Handles user registration, OTP verification, and login.
 */
@Slf4j
@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {
    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody Backend.bimalink.dto.RegisterRequest request) {
        try {
            authService.register(request);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Registration successful. Please check your email for OTP.");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Registration failed", e);
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("error", "Registration failed: " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }
    
    @PostMapping("/register-agent")
    public ResponseEntity<?> registerAgent(@Valid @RequestBody RegisterAgentRequest request) {
        try {
            authService.registerAgent(request);
            return ResponseEntity.ok()
                .body(new AuthResponse(null, "Registration successful. Please check your email for OTP.", null));
        } catch (Exception e) {
            log.error("Registration failed", e);
            return ResponseEntity.badRequest()
                .body(new AuthResponse(null, "Registration failed: " + e.getMessage(), null));
        }
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<?> verifyOtp(@Valid @RequestBody VerifyOtpRequest request) {
        try {
            AuthResponse authResponse = authService.verifyOtp(request);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("token", authResponse.getToken());
            response.put("message", authResponse.getMessage());
            response.put("user", authResponse.getUser());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("OTP verification failed", e);
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("error", "OTP verification failed: " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    @PostMapping("/resend-otp")
    public ResponseEntity<?> resendOtp(@Valid @RequestBody ResendOtpRequest request) {
        try {
            authService.resendOtp(request);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "OTP resent successfully");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Resend OTP failed", e);
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("error", "Failed to resend OTP: " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest request) {
        try {
            authService.loginInitiate(request);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Login credentials verified. Please check your email for OTP.");
            response.put("email", request.getEmail());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Login failed", e);
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("error", "Login failed: " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }
    
    @PostMapping("/login/verify")
    public ResponseEntity<?> verifyLoginOtp(@Valid @RequestBody VerifyOtpRequest request) {
        try {
            AuthResponse authResponse = authService.login(request);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("token", authResponse.getToken());
            response.put("message", authResponse.getMessage());
            response.put("user", authResponse.getUser());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Login OTP verification failed", e);
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("error", "Login verification failed: " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }
}
