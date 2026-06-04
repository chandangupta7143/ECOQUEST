package com.ecoquest.service;

import com.ecoquest.dto.AuthResponse;
import com.ecoquest.dto.LoginRequest;
import com.ecoquest.dto.RegisterRequest;
import com.ecoquest.entity.User;
import com.ecoquest.exception.EcoQuestException;
import com.ecoquest.repository.UserRepository;
import com.ecoquest.security.JwtUtils;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class AuthService {

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

    @Transactional
    public AuthResponse register(RegisterRequest req) {
        String cleanEmail = req.getEmail().trim().toLowerCase();

        // Uniqueness check
        if (userRepository.existsByEmail(cleanEmail)) {
            throw new EcoQuestException(HttpStatus.BAD_REQUEST, "Email already registered");
        }

        // Hash password
        String hashed = passwordEncoder.encode(req.getPassword());

        // Verification token
        String token  = UUID.randomUUID().toString().replace("-", "") + UUID.randomUUID().toString().replace("-", "");
        LocalDateTime expiry = LocalDateTime.now().plusHours(24);

        User.Role role = req.getRole() != null && req.getRole().equals("teacher")
                ? User.Role.teacher : User.Role.student;

        User user = User.builder()
                .name(req.getName().trim())
                .email(cleanEmail)
                .password(hashed)
                .role(role)
                .className(req.getClassName() != null ? req.getClassName() : "")
                .school(req.getSchool() != null ? req.getSchool() : "")
                .isVerified(false)
                .verificationToken(token)
                .verificationTokenExpiry(expiry)
                .build();
        user = userRepository.save(user);

        if (emailService.isEmailConfigured()) {
            // Production: send verification email
            try {
                emailService.sendVerificationEmail(cleanEmail, token);
            } catch (Exception e) {
                userRepository.delete(user);
                throw new EcoQuestException(HttpStatus.INTERNAL_SERVER_ERROR,
                        "Could not send verification email. Please try again.");
            }
            return AuthResponse.builder()
                    .user(AuthResponse.UserDto.builder()
                            .email(cleanEmail)
                            .build())
                    .build();
        } else {
            // Dev mode: auto-verify
            user.setIsVerified(true);
            user.setVerificationToken(null);
            user.setVerificationTokenExpiry(null);
            userRepository.save(user);

            String jwt = jwtUtils.generateToken(user.getId(), user.getRole().name());
            return AuthResponse.builder()
                    .token(jwt)
                    .devMode(true)
                    .user(toUserDto(user))
                    .build();
        }
    }

    public AuthResponse login(LoginRequest req) {
        String cleanEmail = req.getEmail().trim().toLowerCase();
        User user = userRepository.findByEmail(cleanEmail)
                .orElseThrow(() -> new EcoQuestException(HttpStatus.BAD_REQUEST, "Invalid email or password"));

        if (!passwordEncoder.matches(req.getPassword(), user.getPassword())) {
            throw new EcoQuestException(HttpStatus.BAD_REQUEST, "Invalid email or password");
        }

        if (!user.getIsVerified()) {
            throw new EcoQuestException(HttpStatus.FORBIDDEN,
                    "Please verify your email before logging in. Check your inbox for the verification link.");
        }

        String token = jwtUtils.generateToken(user.getId(), user.getRole().name());
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
