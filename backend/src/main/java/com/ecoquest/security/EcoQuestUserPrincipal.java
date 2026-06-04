package com.ecoquest.security;

import com.ecoquest.entity.User;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.List;

public class EcoQuestUserPrincipal implements UserDetails {

    private final User user;

    public EcoQuestUserPrincipal(User user) {
        this.user = user;
    }

    public User getUser() { return user; }
    public Long getId() { return user.getId(); }
    public String getRole() { return user.getRole().name(); }

    @Override public String getUsername()            { return user.getEmail(); }
    @Override public String getPassword()            { return user.getPassword(); }
    @Override public boolean isAccountNonExpired()   { return true; }
    @Override public boolean isAccountNonLocked()    { return true; }
    @Override public boolean isCredentialsNonExpired(){ return true; }
    @Override public boolean isEnabled()             { return Boolean.TRUE.equals(user.getIsVerified()); }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority("ROLE_" + user.getRole().name().toUpperCase()));
    }
}
