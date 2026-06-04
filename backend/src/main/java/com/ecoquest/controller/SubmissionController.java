package com.ecoquest.controller;

import com.ecoquest.dto.ReviewRequest;
import com.ecoquest.entity.*;
import com.ecoquest.exception.EcoQuestException;
import com.ecoquest.repository.*;
import com.ecoquest.security.EcoQuestUserPrincipal;
import com.ecoquest.service.UserProgressService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Base64;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/submissions")
public class SubmissionController {

    private final SubmissionRepository submissionRepository;
    private final UserRepository userRepository;
    private final TaskRepository taskRepository;
    private final NotificationRepository notificationRepository;
    private final UserProgressService progressService;

    @Value("${app.upload.dir}")
    private String uploadDir;

    public SubmissionController(SubmissionRepository submissionRepository,
                                 UserRepository userRepository,
                                 TaskRepository taskRepository,
                                 NotificationRepository notificationRepository,
                                 UserProgressService progressService) {
        this.submissionRepository = submissionRepository;
        this.userRepository = userRepository;
        this.taskRepository = taskRepository;
        this.notificationRepository = notificationRepository;
        this.progressService = progressService;
    }

    /** GET /api/submissions */
    @GetMapping
    public ResponseEntity<?> getSubmissions(
            @AuthenticationPrincipal EcoQuestUserPrincipal principal,
            @RequestParam(required = false) String status
    ) {
        List<Submission> subs;
        if (principal.getUser().getRole() == User.Role.student) {
            subs = submissionRepository.findByStudentIdOrderByCreatedAtDesc(principal.getId());
        } else if (status != null && !status.isBlank()) {
            try {
                subs = submissionRepository.findByStatusOrderByCreatedAtDesc(
                        Submission.SubmissionStatus.valueOf(status));
            } catch (IllegalArgumentException e) {
                subs = submissionRepository.findAllByOrderByCreatedAtDesc();
            }
        } else {
            subs = submissionRepository.findAllByOrderByCreatedAtDesc();
        }
        return ResponseEntity.ok(subs);
    }

    /** POST /api/submissions (student) — multipart */
    @PostMapping
    @Transactional
    public ResponseEntity<?> createSubmission(
            @AuthenticationPrincipal EcoQuestUserPrincipal principal,
            @RequestParam("taskId") Long taskId,
            @RequestParam("description") String description,
            @RequestPart(value = "image", required = false) MultipartFile file
    ) throws IOException {

        User student = userRepository.findById(principal.getId())
                .orElseThrow(() -> new EcoQuestException(HttpStatus.NOT_FOUND, "User not found"));
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new EcoQuestException(HttpStatus.NOT_FOUND, "Task not found"));

        // Store as base64 (works in any environment, no external storage needed)
        String imageUrl = "";
        if (file != null && !file.isEmpty()) {
            validateSubmissionFile(file);
            String contentType = file.getContentType();
            
            // Save as file in /uploads/
            String extension = ".file";
            if (contentType != null && contentType.startsWith("image/")) {
                extension = "." + contentType.substring(6);
            }
            
            String filename = "sub-" + System.currentTimeMillis() + "-" + sanitize(file.getOriginalFilename());
            if (!filename.contains(".")) filename += extension;
            
            Path uploadPath = Paths.get(uploadDir).toAbsolutePath();
            Files.createDirectories(uploadPath);
            Files.copy(file.getInputStream(), uploadPath.resolve(filename), StandardCopyOption.REPLACE_EXISTING);
            imageUrl = "/uploads/" + filename;
        }

        Submission sub = Submission.builder()
                .student(student)
                .task(task)
                .description(description)
                .imageUrl(imageUrl)
                .status(Submission.SubmissionStatus.pending)
                .build();
        sub = submissionRepository.save(sub);

        // Notify teacher
        if (task.getCreatedBy() != null) {
            Notification notif = Notification.builder()
                    .recipient(task.getCreatedBy())
                    .sender(student)
                    .type(Notification.NotificationType.submission_received)
                    .message(student.getName() + " submitted \"" + task.getTitle() + "\"")
                    .taskTitle(task.getTitle())
                    .build();
            notificationRepository.save(notif);
        }

        return ResponseEntity.status(HttpStatus.CREATED).body(sub);
    }

    /** PUT /api/submissions/:id/review (teacher) */
    @PutMapping("/{id}/review")
    @Transactional
    public ResponseEntity<?> reviewSubmission(
            @AuthenticationPrincipal EcoQuestUserPrincipal principal,
            @PathVariable Long id,
            @RequestBody ReviewRequest req
    ) {
        if (principal.getUser().getRole() != User.Role.teacher) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("message", "Forbidden"));
        }

        Submission sub = submissionRepository.findById(id)
                .orElseThrow(() -> new EcoQuestException(HttpStatus.NOT_FOUND, "Submission not found"));

        Submission.SubmissionStatus newStatus = Submission.SubmissionStatus.valueOf(req.getStatus());
        sub.setTeacherScore(req.getTeacherScore());
        sub.setStatus(newStatus);
        sub.setReviewedBy(userRepository.findById(principal.getId()).orElse(null));

        if (newStatus == Submission.SubmissionStatus.approved && req.getTeacherScore() != null) {
            int xp = Math.round((float) req.getTeacherScore() / 10 * sub.getTask().getXpReward());
            sub.setXpAwarded(xp);
            User student = sub.getStudent();
            student.setXp(student.getXp() + xp);
            userRepository.save(student);
            progressService.updateProgress(student.getId());
        }

        sub = submissionRepository.save(sub);

        // Notify student
        User teacher = userRepository.findById(principal.getId()).orElse(null);
        String xpMsg = newStatus == Submission.SubmissionStatus.approved ? " (+" + sub.getXpAwarded() + " XP)" : "";
        String teacherName = teacher != null ? teacher.getName() : "your teacher";
        Notification.NotificationType notifType = newStatus == Submission.SubmissionStatus.approved
                ? Notification.NotificationType.submission_approved
                : Notification.NotificationType.submission_rejected;

        Notification notif = Notification.builder()
                .recipient(sub.getStudent())
                .sender(teacher)
                .type(notifType)
                .message("Your \"" + sub.getTask().getTitle() + "\" submission was "
                        + req.getStatus() + " by " + teacherName + xpMsg)
                .taskTitle(sub.getTask().getTitle())
                .build();
        notificationRepository.save(notif);

        return ResponseEntity.ok(sub);
    }
    private void validateSubmissionFile(MultipartFile file) {
        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            throw new EcoQuestException(HttpStatus.BAD_REQUEST, "Only image files are allowed.");
        }
        if (file.getSize() > 10 * 1024 * 1024) {
            throw new EcoQuestException(HttpStatus.PAYLOAD_TOO_LARGE, "File must be under 10MB");
        }
    }

    private String sanitize(String name) {
        if (name == null) return "file";
        return name.replaceAll("[^a-zA-Z0-9._-]", "_").substring(0, Math.min(80, name.length()));
    }
}
