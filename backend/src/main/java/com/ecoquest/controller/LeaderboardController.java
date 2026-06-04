package com.ecoquest.controller;

import com.ecoquest.entity.User;
import com.ecoquest.repository.UserRepository;
import com.ecoquest.security.EcoQuestUserPrincipal;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.concurrent.atomic.AtomicInteger;

@RestController
@RequestMapping("/api/leaderboard")
public class LeaderboardController {

    private final UserRepository userRepository;

    public LeaderboardController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    /** GET /api/leaderboard?scope=global|class&class= */
    @GetMapping
    public ResponseEntity<?> getLeaderboard(
            @AuthenticationPrincipal EcoQuestUserPrincipal principal,
            @RequestParam(defaultValue = "global") String scope,
            @RequestParam(name = "class", required = false) String className
    ) {
        List<User> users;
        if ("class".equals(scope) && className != null && !className.isBlank()) {
            users = userRepository.findByRoleAndClassNameOrderByXpDesc(User.Role.student, className);
        } else {
            users = userRepository.findByRoleOrderByXpDesc(User.Role.student);
        }

        AtomicInteger rank = new AtomicInteger(1);
        List<Map<String, Object>> ranked = users.stream()
                .limit(50)
                .map(u -> Map.<String, Object>of(
                        "rank",    rank.getAndIncrement(),
                        "id",      u.getId(),
                        "name",    u.getName(),
                        "xp",      u.getXp(),
                        "level",   u.getLevel(),
                        "streak",  u.getStreak(),
                        "className", u.getClassName() != null ? u.getClassName() : "",
                        "school",  u.getSchool() != null ? u.getSchool() : "",
                        "badges",  u.getBadges()
                ))
                .toList();

        return ResponseEntity.ok(ranked);
    }
}
