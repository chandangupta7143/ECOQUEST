package com.ecoquest.config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.jdbc.core.JdbcTemplate;

@Configuration
public class DatabaseInitializer {

    @Bean
    public CommandLineRunner initializeDatabase(JdbcTemplate jdbcTemplate) {
        return args -> {
            try {
                jdbcTemplate.execute("CREATE TABLE IF NOT EXISTS user_interests (user_id BIGINT NOT NULL, interest VARCHAR(255))");
                jdbcTemplate.execute("CREATE TABLE IF NOT EXISTS user_badges (user_id BIGINT NOT NULL, badge VARCHAR(255))");
                System.out.println("✅ Custom Database tables (user_interests, user_badges) created successfully!");
            } catch (Exception e) {
                System.err.println("⚠️ Could not create custom tables: " + e.getMessage());
            }
        };
    }
}
