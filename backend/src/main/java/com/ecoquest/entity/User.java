package com.ecoquest.entity;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String password;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role = Role.student;

    @JsonProperty("class")
    @Column(name = "class_name")
    private String className = "";

    private String school = "";
    private String avatar = "";

    // ── Gamification ─────────────────────────────────────────────
    private Integer xp = 0;
    private Integer level = 1;
    private Integer streak = 0;

    @Column(name = "last_active")
    private LocalDateTime lastActive;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "user_badges", joinColumns = @JoinColumn(name = "user_id"))
    @Column(name = "badge")
    @OrderColumn(name = "badge_order")
    private List<String> badges = new ArrayList<>();

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "user_interests", joinColumns = @JoinColumn(name = "user_id"))
    @Column(name = "interest")
    @OrderColumn(name = "interest_order")
    private List<String> interests = new ArrayList<>();

    @Enumerated(EnumType.STRING)
    @Column(name = "eco_level")
    private EcoLevel ecoLevel = EcoLevel.beginner;

    // ── Email Verification ────────────────────────────────────────
    @Column(name = "is_verified")
    private Boolean isVerified = false;

    @Column(name = "verification_token")
    private String verificationToken;

    @Column(name = "verification_token_expiry")
    private LocalDateTime verificationTokenExpiry;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    public enum Role { student, teacher }
    public enum EcoLevel { beginner, intermediate, advanced }

    // ── Constructors ─────────────────────────────────────────────
    public User() {}

    // ── Getters & Setters ────────────────────────────────────────
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public Role getRole() { return role; }
    public void setRole(Role role) { this.role = role; }

    public String getClassName() { return className; }
    public void setClassName(String className) { this.className = className; }

    public String getSchool() { return school; }
    public void setSchool(String school) { this.school = school; }

    public String getAvatar() { return avatar; }
    public void setAvatar(String avatar) { this.avatar = avatar; }

    public Integer getXp() { return xp; }
    public void setXp(Integer xp) { this.xp = xp; }

    public Integer getLevel() { return level; }
    public void setLevel(Integer level) { this.level = level; }

    public Integer getStreak() { return streak; }
    public void setStreak(Integer streak) { this.streak = streak; }

    public LocalDateTime getLastActive() { return lastActive; }
    public void setLastActive(LocalDateTime lastActive) { this.lastActive = lastActive; }

    public List<String> getBadges() { return badges; }
    public void setBadges(List<String> badges) { this.badges = badges; }

    public List<String> getInterests() { return interests; }
    public void setInterests(List<String> interests) { this.interests = interests; }

    public EcoLevel getEcoLevel() { return ecoLevel; }
    public void setEcoLevel(EcoLevel ecoLevel) { this.ecoLevel = ecoLevel; }

    public Boolean getIsVerified() { return isVerified; }
    public void setIsVerified(Boolean isVerified) { this.isVerified = isVerified; }

    public String getVerificationToken() { return verificationToken; }
    public void setVerificationToken(String verificationToken) { this.verificationToken = verificationToken; }

    public LocalDateTime getVerificationTokenExpiry() { return verificationTokenExpiry; }
    public void setVerificationTokenExpiry(LocalDateTime verificationTokenExpiry) { this.verificationTokenExpiry = verificationTokenExpiry; }

    public LocalDateTime getCreatedAt() { return createdAt; }

    // ── Builder ──────────────────────────────────────────────────
    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private final User user = new User();
        public Builder name(String v) { user.name = v; return this; }
        public Builder email(String v) { user.email = v; return this; }
        public Builder password(String v) { user.password = v; return this; }
        public Builder role(Role v) { user.role = v; return this; }
        public Builder className(String v) { user.className = v; return this; }
        public Builder school(String v) { user.school = v; return this; }
        public Builder avatar(String v) { user.avatar = v; return this; }
        public Builder xp(Integer v) { user.xp = v; return this; }
        public Builder level(Integer v) { user.level = v; return this; }
        public Builder streak(Integer v) { user.streak = v; return this; }
        public Builder badges(List<String> v) { user.badges = v; return this; }
        public Builder interests(List<String> v) { user.interests = v; return this; }
        public Builder ecoLevel(EcoLevel v) { user.ecoLevel = v; return this; }
        public Builder isVerified(Boolean v) { user.isVerified = v; return this; }
        public Builder verificationToken(String v) { user.verificationToken = v; return this; }
        public Builder verificationTokenExpiry(LocalDateTime v) { user.verificationTokenExpiry = v; return this; }
        public User build() { return user; }
    }
}
