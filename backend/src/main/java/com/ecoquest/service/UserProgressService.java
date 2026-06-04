package com.ecoquest.service;

import com.ecoquest.entity.User;
import com.ecoquest.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Shared gamification logic — mirrors userProgress.js updateProgress()
 */
@Service
public class UserProgressService {

    private final UserRepository userRepository;

    public UserProgressService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Transactional
    public void updateProgress(Long userId) {
        User user = userRepository.findById(userId).orElse(null);
        if (user == null) return;

        int xp = user.getXp();

        // Level thresholds (every 500 XP = 1 level, max level 10 at 5000 XP)
        int level = Math.min(10, 1 + (xp / 500));
        user.setLevel(level);

        // Badge awarding
        addBadgeIfAbsent(user, "Eco Starter", xp >= 100);
        addBadgeIfAbsent(user, "Green Warrior", xp >= 500);
        addBadgeIfAbsent(user, "Earth Guardian", xp >= 1000);
        addBadgeIfAbsent(user, "Planet Protector", xp >= 2500);
        addBadgeIfAbsent(user, "Eco Legend", xp >= 5000);

        userRepository.save(user);
    }

    private void addBadgeIfAbsent(User user, String badge, boolean condition) {
        if (condition && !user.getBadges().contains(badge)) {
            user.getBadges().add(badge);
        }
    }
}
