package com.ecoquest.controller;

import com.ecoquest.dto.AuthResponse;
import com.ecoquest.entity.User;
import com.ecoquest.exception.EcoQuestException;
import com.ecoquest.repository.UserRepository;
import com.ecoquest.security.EcoQuestUserPrincipal;
import com.ecoquest.service.AuthService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserRepository userRepository;

    @Value("${app.upload.dir}")
    private String uploadDir;

    public UserController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    /** GET /api/users/me */
    @GetMapping("/me")
    public ResponseEntity<?> getMe(@AuthenticationPrincipal EcoQuestUserPrincipal principal) {
        User user = userRepository.findById(principal.getId())
                .orElseThrow(() -> new EcoQuestException(HttpStatus.NOT_FOUND, "User not found"));
        return ResponseEntity.ok(AuthService.toUserDto(user));
    }

    /** PUT /api/users/me — multipart form */
    @PutMapping("/me")
    public ResponseEntity<?> updateMe(
            @AuthenticationPrincipal EcoQuestUserPrincipal principal,
            @RequestParam(required = false) String name,
            @RequestParam(name = "class", required = false) String className,
            @RequestParam(required = false) String school,
            @RequestParam(required = false) String interests,
            @RequestParam(required = false) String ecoLevel,
            @RequestPart(value = "avatar", required = false) MultipartFile avatarFile
    ) throws IOException {

        User user = userRepository.findById(principal.getId())
                .orElseThrow(() -> new EcoQuestException(HttpStatus.NOT_FOUND, "User not found"));

        if (name != null && !name.isBlank())  user.setName(name.trim());
        if (className != null)                user.setClassName(className);
        if (school != null)                   user.setSchool(school.trim());
        if (interests != null) {
            try {
                // Parse JSON array or comma-separated
                if (interests.startsWith("[")) {
                    String[] arr = interests.replaceAll("[\\[\\]\"]", "").split(",");
                    List<String> list = new ArrayList<>();
                    for (String s : arr) { if (!s.isBlank()) list.add(s.trim()); }
                    user.setInterests(list);
                } else {
                    user.setInterests(Arrays.asList(interests.split(",")));
                }
            } catch (Exception e) { /* ignore */ }
        }
        if (ecoLevel != null && !ecoLevel.isBlank()) {
            try { user.setEcoLevel(User.EcoLevel.valueOf(ecoLevel)); } catch (Exception e) { /* ignore */ }
        }

        if (avatarFile != null && !avatarFile.isEmpty()) {
            validateImageFile(avatarFile);
            String filename = "avatar-" + System.currentTimeMillis() + "-" + sanitize(avatarFile.getOriginalFilename());
            Path uploadPath = Paths.get(uploadDir).toAbsolutePath();
            Files.createDirectories(uploadPath);

            // Delete old avatar
            if (user.getAvatar() != null && user.getAvatar().startsWith("/uploads/")) {
                Path old = uploadPath.resolve(user.getAvatar().replace("/uploads/", ""));
                Files.deleteIfExists(old);
            }

            Files.copy(avatarFile.getInputStream(), uploadPath.resolve(filename), StandardCopyOption.REPLACE_EXISTING);
            user.setAvatar("/uploads/" + filename);
        }

        userRepository.save(user);
        return ResponseEntity.ok(AuthService.toUserDto(user));
    }

    /** GET /api/users/students — teacher only */
    @GetMapping("/students")
    public ResponseEntity<?> getStudents(@AuthenticationPrincipal EcoQuestUserPrincipal principal) {
        if (principal.getUser().getRole() != User.Role.teacher) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("message", "Forbidden"));
        }
        List<User> students = userRepository.findByRoleOrderByXpDesc(User.Role.student);
        List<AuthResponse.UserDto> dtos = students.stream().map(AuthService::toUserDto).toList();
        return ResponseEntity.ok(dtos);
    }

    private void validateImageFile(MultipartFile file) {
        String name = file.getOriginalFilename() != null ? file.getOriginalFilename().toLowerCase() : "";
        if (!name.matches(".*\\.(jpg|jpeg|png|gif|webp)$")) {
            throw new EcoQuestException(HttpStatus.BAD_REQUEST,
                    "Only image files are allowed (jpg, jpeg, png, gif, webp)");
        }
        if (file.getSize() > 10 * 1024 * 1024) {
            throw new EcoQuestException(HttpStatus.PAYLOAD_TOO_LARGE, "Image must be under 10MB");
        }
    }

    private String sanitize(String name) {
        if (name == null) return "file";
        return name.replaceAll("[^a-zA-Z0-9._-]", "_").substring(0, Math.min(60, name.length()));
    }
}
