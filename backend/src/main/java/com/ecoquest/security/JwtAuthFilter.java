package com.ecoquest.security;

import com.ecoquest.entity.User;
import com.ecoquest.repository.UserRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

@Component
public class JwtAuthFilter extends OncePerRequestFilter {

    private final JwtUtils jwtUtils;
    private final UserRepository userRepository;

    public JwtAuthFilter(JwtUtils jwtUtils, UserRepository userRepository) {
        this.jwtUtils = jwtUtils;
        this.userRepository = userRepository;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain)
            throws ServletException, IOException {

        String header = request.getHeader("Authorization");
        if (header == null || !header.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        String token = header.substring(7);
        if (!jwtUtils.validateToken(token)) {
            filterChain.doFilter(request, response);
            return;
        }

        Long userId = jwtUtils.getUserIdFromToken(token);
        String role  = jwtUtils.getRoleFromToken(token);

        User user = userRepository.findById(userId).orElse(null);
        if (user == null) {
            filterChain.doFilter(request, response);
            return;
        }

        // Store full User object as principal for easy access in controllers
        EcoQuestUserPrincipal principal = new EcoQuestUserPrincipal(user);
        UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(
                principal, null,
                List.of(new SimpleGrantedAuthority("ROLE_" + role.toUpperCase()))
        );
        auth.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
        SecurityContextHolder.getContext().setAuthentication(auth);

        filterChain.doFilter(request, response);
    }
}
