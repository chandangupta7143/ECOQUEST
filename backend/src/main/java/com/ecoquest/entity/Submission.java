package com.ecoquest.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "submissions")
public class Submission {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "student_id", nullable = false)
    @JsonIgnoreProperties({"password", "verificationToken", "verificationTokenExpiry", "badges", "interests"})
    private User student;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "task_id", nullable = false)
    private Task task;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String description;

    @Column(name = "image_url", columnDefinition = "MEDIUMTEXT")
    private String imageUrl = "";

    @Column(name = "teacher_score")
    private Integer teacherScore;

    @Enumerated(EnumType.STRING)
    private SubmissionStatus status = SubmissionStatus.pending;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "reviewed_by")
    @JsonIgnoreProperties({"password", "verificationToken", "verificationTokenExpiry"})
    private User reviewedBy;

    @Column(name = "xp_awarded")
    private Integer xpAwarded = 0;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    public enum SubmissionStatus { pending, approved, rejected }

    public Submission() {}

    // Getters & Setters
    public Long getId() { return id; }
    public User getStudent() { return student; }
    public void setStudent(User student) { this.student = student; }
    public Task getTask() { return task; }
    public void setTask(Task task) { this.task = task; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }
    public Integer getTeacherScore() { return teacherScore; }
    public void setTeacherScore(Integer teacherScore) { this.teacherScore = teacherScore; }
    public SubmissionStatus getStatus() { return status; }
    public void setStatus(SubmissionStatus status) { this.status = status; }
    public User getReviewedBy() { return reviewedBy; }
    public void setReviewedBy(User reviewedBy) { this.reviewedBy = reviewedBy; }
    public Integer getXpAwarded() { return xpAwarded; }
    public void setXpAwarded(Integer xpAwarded) { this.xpAwarded = xpAwarded; }
    public LocalDateTime getCreatedAt() { return createdAt; }

    // Builder
    public static Builder builder() { return new Builder(); }
    public static class Builder {
        private final Submission s = new Submission();
        public Builder student(User v) { s.student = v; return this; }
        public Builder task(Task v) { s.task = v; return this; }
        public Builder description(String v) { s.description = v; return this; }
        public Builder imageUrl(String v) { s.imageUrl = v; return this; }
        public Builder status(SubmissionStatus v) { s.status = v; return this; }
        public Submission build() { return s; }
    }
}
