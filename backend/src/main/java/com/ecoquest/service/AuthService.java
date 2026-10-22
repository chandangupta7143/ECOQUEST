package com.ecoquest.service;

import com.ecoquest.dto.AuthResponse;
import com.ecoquest.dto.LoginRequest;
import com.ecoquest.dto.RegisterRequest;
import com.ecoquest.entity.User;
import com.ecoquest.exception.EcoQuestException;
import com.ecoquest.repository.UserRepository;
import com.ecoquest.security.JwtUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class AuthService {

    private static final Logger log = LoggerFactory.getLogger(AuthService.class);

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtils jwtUtils;
    private final EmailService emailService;

    public AuthService(UserRepository userRepository,
                       PasswordEncoder passwordEncoder,
                       JwtUtils jwtUtils,
                       EmailService emailService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtils = jwtUtils;
        this.emailService = emailService;
    }

    public AuthResponse register(RegisterRequest req) {
        long tStart = System.currentTimeMillis();
        String cleanEmail = req.getEmail().trim().toLowerCase();

        // 1. Uniqueness check
        long tBeforeCheck = System.currentTimeMillis();
        if (userRepository.existsByEmail(cleanEmail)) {
            throw new EcoQuestException(HttpStatus.BAD_REQUEST, "Email already registered");
        }
        long emailCheckMs = System.currentTimeMillis() - tBeforeCheck;

        // 2. Hash password (CPU-bound, kept outside DB transaction)
        long tBeforeHash = System.currentTimeMillis();
        String hashed = passwordEncoder.encode(req.getPassword());
        long passwordHashMs = System.currentTimeMillis() - tBeforeHash;

        boolean emailEnabled = emailService.isEmailConfigured();
        String token = emailEnabled
                ? UUID.randomUUID().toString().replace("-", "") + UUID.randomUUID().toString().replace("-", "")
                : null;
        LocalDateTime expiry = emailEnabled ? LocalDateTime.now().plusHours(24) : null;

        User.Role role = req.getRole() != null && req.getRole().equals("teacher")
                ? User.Role.teacher : User.Role.student;

        // 3. Persist user in a concise transaction
        long tBeforeSave = System.currentTimeMillis();
        User user = saveNewUser(req.getName().trim(), cleanEmail, hashed, role,
                req.getClassName() != null ? req.getClassName() : "",
                req.getSchool() != null ? req.getSchool() : "",
                !emailEnabled, token, expiry);
        long dbSaveMs = System.currentTimeMillis() - tBeforeSave;

        // 4. Handle email verification outside DB transaction to avoid connection pool starvation
        long emailSendMs = 0;
        if (emailEnabled) {
            long tBeforeEmail = System.currentTimeMillis();
            try {
                emailService.sendVerificationEmail(cleanEmail, token);
                emailSendMs = System.currentTimeMillis() - tBeforeEmail;
            } catch (Exception e) {
                log.error("Failed to send verification email to recipient: {}", e.getMessage());
                deleteFailedUser(user.getId());
                throw new EcoQuestException(HttpStatus.INTERNAL_SERVER_ERROR,
                        "Could not send verification email. Please try again.");
            }

            long totalMs = System.currentTimeMillis() - tStart;
            log.info("Auth register completed in {}ms [emailCheck={}ms, passwordHash={}ms, dbSave={}ms, emailSend={}ms, autoVerify=false]",
                    totalMs, emailCheckMs, passwordHashMs, dbSaveMs, emailSendMs);

            return AuthResponse.builder()
                    .user(AuthResponse.UserDto.builder()
                            .email(cleanEmail)
                            .build())
                    .build();
        } else {
            // Dev mode: auto-verified with single save
            String jwt = jwtUtils.generateToken(user.getId(), user.getRole().name());
            long totalMs = System.currentTimeMillis() - tStart;
            log.info("Auth register completed in {}ms [emailCheck={}ms, passwordHash={}ms, dbSave={}ms, emailSend=0ms, autoVerify=true]",
                    totalMs, emailCheckMs, passwordHashMs, dbSaveMs);

            return AuthResponse.builder()
                    .token(jwt)
                    .devMode(true)
                    .user(toUserDto(user))
                    .build();
        }
    }

    @Transactional
    public User saveNewUser(String name, String email, String password, User.Role role,
                            String className, String school, boolean isVerified,
                            String token, LocalDateTime expiry) {
        User user = User.builder()
                .name(name)
                .email(email)
                .password(password)
                .role(role)
                .className(className)
                .school(school)
                .isVerified(isVerified)
                .verificationToken(token)
                .verificationTokenExpiry(expiry)
                .build();
        return userRepository.save(user);
    }

    @Transactional
    public void deleteFailedUser(Long userId) {
        try {
            userRepository.deleteById(userId);
        } catch (Exception ex) {
            log.warn("Could not clean up unverified user with id {}: {}", userId, ex.getMessage());
        }
    }

    public AuthResponse login(LoginRequest req) {
        long tStart = System.currentTimeMillis();
        String cleanEmail = req.getEmail().trim().toLowerCase();

        long tBeforeLookup = System.currentTimeMillis();
        User user = userRepository.findByEmail(cleanEmail)
                .orElseThrow(() -> new EcoQuestException(HttpStatus.BAD_REQUEST, "Invalid email or password"));
        long userLookupMs = System.currentTimeMillis() - tBeforeLookup;

        long tBeforeVerify = System.currentTimeMillis();
        if (!passwordEncoder.matches(req.getPassword(), user.getPassword())) {
            throw new EcoQuestException(HttpStatus.BAD_REQUEST, "Invalid email or password");
        }
        long passwordVerifyMs = System.currentTimeMillis() - tBeforeVerify;

        if (!user.getIsVerified()) {
            throw new EcoQuestException(HttpStatus.FORBIDDEN,
                    "Please verify your email before logging in. Check your inbox for the verification link.");
        }

        String token = jwtUtils.generateToken(user.getId(), user.getRole().name());
        long totalMs = System.currentTimeMillis() - tStart;
        log.info("Auth login completed in {}ms [userLookup={}ms, passwordVerify={}ms]",
                totalMs, userLookupMs, passwordVerifyMs);

        return AuthResponse.builder()
                .token(token)
                .user(toUserDto(user))
                .build();
    }

    @Transactional
    public void verifyEmail(String token) {
        User user = userRepository.findByVerificationToken(token)
                .orElseThrow(() -> new EcoQuestException(HttpStatus.BAD_REQUEST,
                        "Invalid or already used verification link"));

        if (user.getVerificationTokenExpiry().isBefore(LocalDateTime.now())) {
            throw new EcoQuestException(HttpStatus.BAD_REQUEST,
                    "Verification link has expired. Please register again.");
        }

        user.setIsVerified(true);
        user.setVerificationToken(null);
        user.setVerificationTokenExpiry(null);
        userRepository.save(user);
    }

    @Transactional
    public void resendVerification(String email) {
        String cleanEmail = email.trim().toLowerCase();
        userRepository.findByEmail(cleanEmail).ifPresent(user -> {
            if (!user.getIsVerified()) {
                String token  = UUID.randomUUID().toString().replace("-", "") + UUID.randomUUID().toString().replace("-", "");
                user.setVerificationToken(token);
                user.setVerificationTokenExpiry(LocalDateTime.now().plusHours(24));
                userRepository.save(user);
                emailService.sendVerificationEmail(cleanEmail, token);
            }
        });
    }

    public static AuthResponse.UserDto toUserDto(User user) {
        return AuthResponse.UserDto.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole().name())
                .xp(user.getXp())
                .level(user.getLevel())
                .streak(user.getStreak())
                .className(user.getClassName())
                .school(user.getSchool())
                .avatar(user.getAvatar())
                .badges(user.getBadges())
                .interests(user.getInterests())
                .ecoLevel(user.getEcoLevel() != null ? user.getEcoLevel().name() : "")
                .isVerified(user.getIsVerified())
                .build();
    }
}
