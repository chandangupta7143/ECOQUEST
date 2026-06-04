package com.ecoquest.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "tasks")
public class Task {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Category category;

    @Enumerated(EnumType.STRING)
    private TaskType type = TaskType.daily;

    @Column(name = "xp_reward")
    private Integer xpReward = 50;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "created_by")
    @JsonIgnoreProperties({"password", "verificationToken", "verificationTokenExpiry"})
    private User createdBy;

    private Boolean isActive = true;

    @JsonProperty("class")
    @Column(name = "class_name")
    private String className;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    public enum Category { waste, water, energy, cleanliness, plantation }
    public enum TaskType { daily, weekly, mission }

    public Task() {}

    // Getters & Setters
    public Long getId() { return id; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public Category getCategory() { return category; }
    public void setCategory(Category category) { this.category = category; }
    public TaskType getType() { return type; }
    public void setType(TaskType type) { this.type = type; }
    public Integer getXpReward() { return xpReward; }
    public void setXpReward(Integer xpReward) { this.xpReward = xpReward; }
    public User getCreatedBy() { return createdBy; }
    public void setCreatedBy(User createdBy) { this.createdBy = createdBy; }
    public Boolean getIsActive() { return isActive; }
    public void setIsActive(Boolean isActive) { this.isActive = isActive; }
    public String getClassName() { return className; }
    public void setClassName(String className) { this.className = className; }
    public LocalDateTime getCreatedAt() { return createdAt; }

    // Builder
    public static Builder builder() { return new Builder(); }
    public static class Builder {
        private final Task t = new Task();
        public Builder title(String v) { t.title = v; return this; }
        public Builder description(String v) { t.description = v; return this; }
        public Builder category(Category v) { t.category = v; return this; }
        public Builder type(TaskType v) { t.type = v; return this; }
        public Builder xpReward(Integer v) { t.xpReward = v; return this; }
        public Builder createdBy(User v) { t.createdBy = v; return this; }
        public Builder className(String v) { t.className = v; return this; }
        public Builder isActive(Boolean v) { t.isActive = v; return this; }
        public Task build() { return t; }
    }
}
