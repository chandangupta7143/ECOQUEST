package com.ecoquest.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "notes")
public class Note {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false)
    private String subject;

    private String chapter = "";

    @JsonProperty("class")
    @Column(name = "class_name", nullable = false)
    private String className;

    @Enumerated(EnumType.STRING)
    private NoteType type = NoteType.pdf;

    @Column(name = "file_url")
    private String fileUrl = "";

    @Column(name = "file_original_name")
    private String fileOriginalName = "";

    @Column(name = "external_url")
    private String externalUrl = "";

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "uploaded_by")
    @JsonIgnoreProperties({"password", "verificationToken", "verificationTokenExpiry"})
    private User uploadedBy;

    private Boolean isActive = true;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    public enum NoteType { pdf, url, video, image }

    public Note() {}

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
    public NoteType getType() { return type; }
    public void setType(NoteType type) { this.type = type; }
    public String getFileUrl() { return fileUrl; }
    public void setFileUrl(String fileUrl) { this.fileUrl = fileUrl; }
    public String getFileOriginalName() { return fileOriginalName; }
    public void setFileOriginalName(String fileOriginalName) { this.fileOriginalName = fileOriginalName; }
    public String getExternalUrl() { return externalUrl; }
    public void setExternalUrl(String externalUrl) { this.externalUrl = externalUrl; }
    public User getUploadedBy() { return uploadedBy; }
    public void setUploadedBy(User uploadedBy) { this.uploadedBy = uploadedBy; }
    public Boolean getIsActive() { return isActive; }
    public void setIsActive(Boolean isActive) { this.isActive = isActive; }
    public LocalDateTime getCreatedAt() { return createdAt; }

    // Builder
    public static Builder builder() { return new Builder(); }
    public static class Builder {
        private final Note n = new Note();
        public Builder title(String v) { n.title = v; return this; }
        public Builder subject(String v) { n.subject = v; return this; }
        public Builder chapter(String v) { n.chapter = v; return this; }
        public Builder className(String v) { n.className = v; return this; }
        public Builder type(NoteType v) { n.type = v; return this; }
        public Builder fileUrl(String v) { n.fileUrl = v; return this; }
        public Builder fileOriginalName(String v) { n.fileOriginalName = v; return this; }
        public Builder externalUrl(String v) { n.externalUrl = v; return this; }
        public Builder uploadedBy(User v) { n.uploadedBy = v; return this; }
        public Note build() { return n; }
    }
}
