package com.ecoquest.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "quiz_attempts")
public class QuizAttempt {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "student_id", nullable = false)
    @JsonIgnoreProperties({"password", "verificationToken", "verificationTokenExpiry"})
    private User student;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "quiz_id", nullable = false)
    @JsonIgnoreProperties({"questions", "createdBy"})
    private Quiz quiz;

    @Column(nullable = false)
    private Integer score;

    @Column(name = "xp_earned")
    private Integer xpEarned = 0;

    private Integer correct = 0;
    private Integer total = 0;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    public QuizAttempt() {}

    // Getters & Setters
    public Long getId() { return id; }
    public User getStudent() { return student; }
    public void setStudent(User student) { this.student = student; }
    public Quiz getQuiz() { return quiz; }
    public void setQuiz(Quiz quiz) { this.quiz = quiz; }
    public Integer getScore() { return score; }
    public void setScore(Integer score) { this.score = score; }
    public Integer getXpEarned() { return xpEarned; }
    public void setXpEarned(Integer xpEarned) { this.xpEarned = xpEarned; }
    public Integer getCorrect() { return correct; }
    public void setCorrect(Integer correct) { this.correct = correct; }
    public Integer getTotal() { return total; }
    public void setTotal(Integer total) { this.total = total; }
    public LocalDateTime getCreatedAt() { return createdAt; }

    // Builder
    public static Builder builder() { return new Builder(); }
    public static class Builder {
        private final QuizAttempt a = new QuizAttempt();
        public Builder student(User v) { a.student = v; return this; }
        public Builder quiz(Quiz v) { a.quiz = v; return this; }
        public Builder score(Integer v) { a.score = v; return this; }
        public Builder xpEarned(Integer v) { a.xpEarned = v; return this; }
        public Builder correct(Integer v) { a.correct = v; return this; }
        public Builder total(Integer v) { a.total = v; return this; }
        public QuizAttempt build() { return a; }
    }
}
