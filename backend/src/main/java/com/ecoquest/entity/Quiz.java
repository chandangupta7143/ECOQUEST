package com.ecoquest.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "quizzes")
public class Quiz {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false)
    private String subject;

    @Column(nullable = false)
    private String chapter;

    @JsonProperty("class")
    @Column(name = "class_name", nullable = false)
    private String className;

    @OneToMany(mappedBy = "quiz", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    @OrderBy("questionOrder ASC")
    private List<QuizQuestion> questions = new ArrayList<>();

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "created_by")
    @JsonIgnoreProperties({"password", "verificationToken", "verificationTokenExpiry"})
    private User createdBy;

    private Boolean isActive = true;

    @Column(name = "xp_reward")
    private Integer xpReward = 100;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    public Quiz() {}

    // Getters & Setters
    public Long getId() { return id; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getSubject() { return subject; }
    public void setSubject(String subject) { this.subject = subject; }
    public String getChapter() { return chapter; }
    public void setChapter(String chapter) { this.chapter = chapter; }
    public String getClassName() { return className; }
    public void setClassName(String className) { this.className = className; }
    public List<QuizQuestion> getQuestions() { return questions; }
    public void setQuestions(List<QuizQuestion> questions) { this.questions = questions; }
    public User getCreatedBy() { return createdBy; }
    public void setCreatedBy(User createdBy) { this.createdBy = createdBy; }
    public Boolean getIsActive() { return isActive; }
    public void setIsActive(Boolean isActive) { this.isActive = isActive; }
    public Integer getXpReward() { return xpReward; }
    public void setXpReward(Integer xpReward) { this.xpReward = xpReward; }
    public LocalDateTime getCreatedAt() { return createdAt; }

    // Builder
    public static Builder builder() { return new Builder(); }
    public static class Builder {
        private final Quiz q = new Quiz();
        public Builder title(String v) { q.title = v; return this; }
        public Builder subject(String v) { q.subject = v; return this; }
        public Builder chapter(String v) { q.chapter = v; return this; }
        public Builder className(String v) { q.className = v; return this; }
        public Builder createdBy(User v) { q.createdBy = v; return this; }
        public Builder xpReward(Integer v) { q.xpReward = v; return this; }
        public Builder isActive(Boolean v) { q.isActive = v; return this; }
        public Quiz build() { return q; }
    }
}
