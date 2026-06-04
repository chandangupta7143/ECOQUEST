package com.ecoquest.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "notifications")
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "recipient_id", nullable = false)
    @JsonIgnoreProperties({"password", "verificationToken", "verificationTokenExpiry"})
    private User recipient;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "sender_id")
    @JsonIgnoreProperties({"password", "verificationToken", "verificationTokenExpiry"})
    private User sender;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private NotificationType type;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String message;

    @Column(name = "task_title")
    private String taskTitle = "";

    @Column(name = "is_read")
    private Boolean read = false;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    public enum NotificationType {
        submission_received, submission_approved, submission_rejected
    }

    public Notification() {}

    // Getters & Setters
    public Long getId() { return id; }
    public User getRecipient() { return recipient; }
    public void setRecipient(User recipient) { this.recipient = recipient; }
    public User getSender() { return sender; }
    public void setSender(User sender) { this.sender = sender; }
    public NotificationType getType() { return type; }
    public void setType(NotificationType type) { this.type = type; }
    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
    public String getTaskTitle() { return taskTitle; }
    public void setTaskTitle(String taskTitle) { this.taskTitle = taskTitle; }
    public Boolean getRead() { return read; }
    public void setRead(Boolean read) { this.read = read; }
    public LocalDateTime getCreatedAt() { return createdAt; }

    // Builder
    public static Builder builder() { return new Builder(); }
    public static class Builder {
        private final Notification n = new Notification();
        public Builder recipient(User v) { n.recipient = v; return this; }
        public Builder sender(User v) { n.sender = v; return this; }
        public Builder type(NotificationType v) { n.type = v; return this; }
        public Builder message(String v) { n.message = v; return this; }
        public Builder taskTitle(String v) { n.taskTitle = v; return this; }
        public Builder read(Boolean v) { n.read = v; return this; }
        public Notification build() { return n; }
    }
}
