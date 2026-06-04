package com.ecoquest.controller;

import com.ecoquest.dto.AuthResponse;
import com.ecoquest.dto.LoginRequest;
import com.ecoquest.dto.RegisterRequest;
import com.ecoquest.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    /** POST /api/auth/register */
    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest req) {
        AuthResponse response = authService.register(req);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /** POST /api/auth/login */
    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest req) {
        AuthResponse response = authService.login(req);
        return ResponseEntity.ok(response);
    }

    /** GET /api/auth/verify-email?token=<hex> */
    @GetMapping("/verify-email")
    public ResponseEntity<?> verifyEmail(@RequestParam String token) {
        authService.verifyEmail(token);
        return ResponseEntity.ok(Map.of("message", "Email verified successfully! You can now log in."));
    }

    /** POST /api/auth/resend-verification */
    @PostMapping("/resend-verification")
    public ResponseEntity<?> resendVerification(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        if (email == null || email.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Email is required"));
        }
        authService.resendVerification(email);
        return ResponseEntity.ok(Map.of("message",
                "If this email is registered and unverified, a new link has been sent."));
    }
}
