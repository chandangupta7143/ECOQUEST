package com.ecoquest.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;

@Entity
@Table(name = "chapters")
public class Chapter {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(name = "chapter_order")
    private Integer chapterOrder = 0;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "subject_id", nullable = false)
    @JsonIgnore
    private Subject subject;

    public Chapter() {}

    // Getters & Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public Integer getChapterOrder() { return chapterOrder; }
    public void setChapterOrder(Integer chapterOrder) { this.chapterOrder = chapterOrder; }

    public Subject getSubject() { return subject; }
    public void setSubject(Subject subject) { this.subject = subject; }

    // Builder
    public static Builder builder() { return new Builder(); }
    public static class Builder {
        private final Chapter c = new Chapter();
        public Builder name(String v) { c.name = v; return this; }
        public Builder chapterOrder(Integer v) { c.chapterOrder = v; return this; }
        public Builder subject(Subject v) { c.subject = v; return this; }
        public Chapter build() { return c; }
    }
}
