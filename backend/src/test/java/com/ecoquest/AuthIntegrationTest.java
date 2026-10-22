package com.ecoquest;

import com.ecoquest.dto.AuthResponse;
import com.ecoquest.dto.LoginRequest;
import com.ecoquest.dto.RegisterRequest;
import com.ecoquest.entity.User;
import com.ecoquest.exception.EcoQuestException;
import com.ecoquest.repository.UserRepository;
import com.ecoquest.service.AuthService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.TestPropertySource;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@TestPropertySource(locations = "classpath:application-test.properties")
public class AuthIntegrationTest {

    @Autowired
    private AuthService authService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @BeforeEach
    public void setup() {
        userRepository.deleteAll();
    }

    @Test
    public void testSuccessfulRegistrationStudent() {
        RegisterRequest req = new RegisterRequest();
        req.setName("Test Student");
        req.setEmail("student@example.com");
        req.setPassword("Password123!");
        req.setRole("student");
        req.setClassName("Class 10");
        req.setSchool("Greenwood High");

        AuthResponse res = authService.register(req);

        assertNotNull(res);
        assertTrue(Boolean.TRUE.equals(res.getDevMode()), "In dev mode (no email credentials), devMode should be true");
        assertNotNull(res.getToken(), "Dev mode should return a JWT token");
        assertNotNull(res.getUser());
        assertEquals("student@example.com", res.getUser().getEmail());
        assertEquals("student", res.getUser().getRole());
        assertEquals("Class 10", res.getUser().getClassName());

        // Verify database state
        User userInDb = userRepository.findByEmail("student@example.com").orElse(null);
        assertNotNull(userInDb);
        assertTrue(userInDb.getIsVerified());
        assertTrue(passwordEncoder.matches("Password123!", userInDb.getPassword()));
    }

    @Test
    public void testSuccessfulRegistrationTeacher() {
        RegisterRequest req = new RegisterRequest();
        req.setName("Test Teacher");
        req.setEmail("teacher@example.com");
        req.setPassword("SecurePass123!");
        req.setRole("teacher");
        req.setSchool("City Academy");

        AuthResponse res = authService.register(req);

        assertNotNull(res);
        assertNotNull(res.getUser());
        assertEquals("teacher", res.getUser().getRole());

        User userInDb = userRepository.findByEmail("teacher@example.com").orElse(null);
        assertNotNull(userInDb);
        assertEquals(User.Role.teacher, userInDb.getRole());
    }

    @Test
    public void testDuplicateEmailRegistrationFails() {
        RegisterRequest req1 = new RegisterRequest();
        req1.setName("User One");
        req1.setEmail("duplicate@example.com");
        req1.setPassword("Password123!");
        authService.register(req1);

        RegisterRequest req2 = new RegisterRequest();
        req2.setName("User Two");
        req2.setEmail("duplicate@example.com");
        req2.setPassword("Password456!");

        EcoQuestException ex = assertThrows(EcoQuestException.class, () -> authService.register(req2));
        assertEquals("Email already registered", ex.getMessage());
    }

    @Test
    public void testSuccessfulLogin() {
        RegisterRequest regReq = new RegisterRequest();
        regReq.setName("Login Tester");
        regReq.setEmail("login@example.com");
        regReq.setPassword("MyPassword123!");
        authService.register(regReq);

        LoginRequest loginReq = new LoginRequest();
        loginReq.setEmail("login@example.com");
        loginReq.setPassword("MyPassword123!");

        AuthResponse loginRes = authService.login(loginReq);
        assertNotNull(loginRes);
        assertNotNull(loginRes.getToken());
        assertEquals("login@example.com", loginRes.getUser().getEmail());
    }

    @Test
    public void testInvalidPasswordLoginFails() {
        RegisterRequest regReq = new RegisterRequest();
        regReq.setName("Login Tester");
        regReq.setEmail("wrongpass@example.com");
        regReq.setPassword("CorrectPassword123!");
        authService.register(regReq);

        LoginRequest loginReq = new LoginRequest();
        loginReq.setEmail("wrongpass@example.com");
        loginReq.setPassword("WrongPassword!");

        EcoQuestException ex = assertThrows(EcoQuestException.class, () -> authService.login(loginReq));
        assertEquals("Invalid email or password", ex.getMessage());
    }

    @Test
    public void testNonExistentEmailLoginFails() {
        LoginRequest loginReq = new LoginRequest();
        loginReq.setEmail("nonexistent@example.com");
        loginReq.setPassword("AnyPassword!");

        EcoQuestException ex = assertThrows(EcoQuestException.class, () -> authService.login(loginReq));
        assertEquals("Invalid email or password", ex.getMessage());
    }

    @Test
    public void testUnverifiedUserCannotLogin() {
        // Create an unverified user manually
        User unverified = User.builder()
                .name("Unverified User")
                .email("unverified@example.com")
                .password(passwordEncoder.encode("Password123!"))
                .role(User.Role.student)
                .isVerified(false)
                .verificationToken("token123")
                .verificationTokenExpiry(java.time.LocalDateTime.now().plusHours(24))
                .build();
        userRepository.save(unverified);

        LoginRequest loginReq = new LoginRequest();
        loginReq.setEmail("unverified@example.com");
        loginReq.setPassword("Password123!");

        EcoQuestException ex = assertThrows(EcoQuestException.class, () -> authService.login(loginReq));
        assertTrue(ex.getMessage().contains("Please verify your email before logging in"));
    }

    @Test
    public void testEmailVerificationSuccess() {
        String token = "valid-token-12345";
        User unverified = User.builder()
                .name("Verification User")
                .email("verify@example.com")
                .password(passwordEncoder.encode("Password123!"))
                .role(User.Role.student)
                .isVerified(false)
                .verificationToken(token)
                .verificationTokenExpiry(java.time.LocalDateTime.now().plusHours(24))
                .build();
        userRepository.save(unverified);

        authService.verifyEmail(token);

        User verified = userRepository.findByEmail("verify@example.com").orElse(null);
        assertNotNull(verified);
        assertTrue(verified.getIsVerified());
        assertNull(verified.getVerificationToken());
        assertNull(verified.getVerificationTokenExpiry());
    }

    @Test
    public void testExpiredVerificationTokenFails() {
        String token = "expired-token-12345";
        User unverified = User.builder()
                .name("Expired User")
                .email("expired@example.com")
                .password(passwordEncoder.encode("Password123!"))
                .role(User.Role.student)
                .isVerified(false)
                .verificationToken(token)
                .verificationTokenExpiry(java.time.LocalDateTime.now().minusHours(1))
                .build();
        userRepository.save(unverified);

        EcoQuestException ex = assertThrows(EcoQuestException.class, () -> authService.verifyEmail(token));
        assertTrue(ex.getMessage().contains("expired"));
    }

    @Test
    public void testBCryptCostFactorCrossCompatibility() {
        // Test that existing passwords hashed with cost 12 verify correctly with current encoder
        org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder cost12Encoder =
                new org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder(12);
        String rawPassword = "ExistingUserPassword2024!";
        String hash12 = cost12Encoder.encode(rawPassword);

        // Verification using application's configured PasswordEncoder
        assertTrue(passwordEncoder.matches(rawPassword, hash12),
                "Configured PasswordEncoder must transparently verify existing cost 12 hashes");
        assertFalse(passwordEncoder.matches("WrongPassword", hash12));
    }
}
