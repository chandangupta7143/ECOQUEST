package com.ecoquest.controller;

import com.ecoquest.entity.Notification;
import com.ecoquest.exception.EcoQuestException;
import com.ecoquest.repository.NotificationRepository;
import com.ecoquest.security.EcoQuestUserPrincipal;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    private final NotificationRepository notificationRepository;

    public NotificationController(NotificationRepository notificationRepository) {
        this.notificationRepository = notificationRepository;
    }

    /** GET /api/notifications */
    @GetMapping
    public ResponseEntity<?> getNotifications(@AuthenticationPrincipal EcoQuestUserPrincipal principal) {
        List<Notification> notifications = notificationRepository
                .findByRecipientIdOrderByCreatedAtDesc(principal.getId());
        // Limit to 20 like original
        return ResponseEntity.ok(notifications.stream().limit(20).toList());
    }

    /** PUT /api/notifications/read-all */
    @PutMapping("/read-all")
    @Transactional
    public ResponseEntity<?> markAllRead(@AuthenticationPrincipal EcoQuestUserPrincipal principal) {
        notificationRepository.markAllAsReadByRecipient(principal.getId());
        return ResponseEntity.ok(Map.of("success", true));
    }

    /** PUT /api/notifications/:id/read */
    @PutMapping("/{id}/read")
    @Transactional
    public ResponseEntity<?> markOneRead(
            @AuthenticationPrincipal EcoQuestUserPrincipal principal,
            @PathVariable Long id
    ) {
        Notification notif = notificationRepository.findById(id)
                .orElseThrow(() -> new EcoQuestException(HttpStatus.NOT_FOUND, "Notification not found"));

        if (!notif.getRecipient().getId().equals(principal.getId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("message", "Forbidden"));
        }
        notif.setRead(true);
        notificationRepository.save(notif);
        return ResponseEntity.ok(Map.of("success", true));
    }
}
