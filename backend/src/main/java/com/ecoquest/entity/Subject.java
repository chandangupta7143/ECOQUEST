package com.ecoquest.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "subjects")
public class Subject {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @JsonProperty("class")
    @Column(name = "class_name")
    private String className = "";

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "created_by")
    @JsonIgnoreProperties({"password", "verificationToken", "verificationTokenExpiry"})
    private User createdBy;

    private Boolean isActive = true;

    @OneToMany(mappedBy = "subject", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    @OrderBy("chapterOrder ASC")
    private List<Chapter> chapters = new ArrayList<>();

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    public Subject() {}

    // Getters & Setters
    public Long getId() { return id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getClassName() { return className; }
    public void setClassName(String className) { this.className = className; }
    public User getCreatedBy() { return createdBy; }
    public void setCreatedBy(User createdBy) { this.createdBy = createdBy; }
    public Boolean getIsActive() { return isActive; }
    public void setIsActive(Boolean isActive) { this.isActive = isActive; }
    public List<Chapter> getChapters() { return chapters; }
    public void setChapters(List<Chapter> chapters) { this.chapters = chapters; }
    public LocalDateTime getCreatedAt() { return createdAt; }

    // Builder
    public static Builder builder() { return new Builder(); }
    public static class Builder {
        private final Subject s = new Subject();
        public Builder name(String v) { s.name = v; return this; }
        public Builder className(String v) { s.className = v; return this; }
        public Builder createdBy(User v) { s.createdBy = v; return this; }
        public Builder isActive(Boolean v) { s.isActive = v; return this; }
        public Subject build() { return s; }
    }
}
