package com.ecoquest.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.List;

public class AuthResponse {
    private String token;
    private UserDto user;
    private Boolean devMode;

    public AuthResponse() {}
    public AuthResponse(String token, UserDto user, Boolean devMode) {
        this.token = token; this.user = user; this.devMode = devMode;
    }

    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }
    public UserDto getUser() { return user; }
    public void setUser(UserDto user) { this.user = user; }
    public Boolean getDevMode() { return devMode; }
    public void setDevMode(Boolean devMode) { this.devMode = devMode; }

    public static Builder builder() { return new Builder(); }
    public static class Builder {
        private final AuthResponse r = new AuthResponse();
        public Builder token(String v) { r.token = v; return this; }
        public Builder user(UserDto v) { r.user = v; return this; }
        public Builder devMode(Boolean v) { r.devMode = v; return this; }
        public AuthResponse build() { return r; }
    }

    // ── Inner DTO ─────────────────────────────────────────────────
    public static class UserDto {
        private Long id;
        private String name;
        private String email;
        private String role;
        private Integer xp;
        private Integer level;
        private Integer streak;

        @JsonProperty("class")
        private String className;

        private String school;
        private String avatar;
        private List<String> badges;
        private List<String> interests;
        private String ecoLevel;

        @JsonProperty("isVerified")
        private Boolean isVerified;

        public UserDto() {}

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public String getRole() { return role; }
        public void setRole(String role) { this.role = role; }
        public Integer getXp() { return xp; }
        public void setXp(Integer xp) { this.xp = xp; }
        public Integer getLevel() { return level; }
        public void setLevel(Integer level) { this.level = level; }
        public Integer getStreak() { return streak; }
        public void setStreak(Integer streak) { this.streak = streak; }
        public String getClassName() { return className; }
        public void setClassName(String className) { this.className = className; }
        public String getSchool() { return school; }
        public void setSchool(String school) { this.school = school; }
        public String getAvatar() { return avatar; }
        public void setAvatar(String avatar) { this.avatar = avatar; }
        public List<String> getBadges() { return badges; }
        public void setBadges(List<String> badges) { this.badges = badges; }
        public List<String> getInterests() { return interests; }
        public void setInterests(List<String> interests) { this.interests = interests; }
        public String getEcoLevel() { return ecoLevel; }
        public void setEcoLevel(String ecoLevel) { this.ecoLevel = ecoLevel; }
        public Boolean getIsVerified() { return isVerified; }
        public void setIsVerified(Boolean isVerified) { this.isVerified = isVerified; }

        public static Builder builder() { return new Builder(); }
        public static class Builder {
            private final UserDto u = new UserDto();
            public Builder id(Long v) { u.id = v; return this; }
            public Builder name(String v) { u.name = v; return this; }
            public Builder email(String v) { u.email = v; return this; }
            public Builder role(String v) { u.role = v; return this; }
            public Builder xp(Integer v) { u.xp = v; return this; }
            public Builder level(Integer v) { u.level = v; return this; }
            public Builder streak(Integer v) { u.streak = v; return this; }
            public Builder className(String v) { u.className = v; return this; }
            public Builder school(String v) { u.school = v; return this; }
            public Builder avatar(String v) { u.avatar = v; return this; }
            public Builder badges(List<String> v) { u.badges = v; return this; }
            public Builder interests(List<String> v) { u.interests = v; return this; }
            public Builder ecoLevel(String v) { u.ecoLevel = v; return this; }
            public Builder isVerified(Boolean v) { u.isVerified = v; return this; }
            public UserDto build() { return u; }
        }
    }
}
