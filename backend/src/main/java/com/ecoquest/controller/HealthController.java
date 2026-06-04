package com.ecoquest.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.sql.DataSource;
import java.sql.Connection;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class HealthController {

    private final DataSource dataSource;

    public HealthController(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    @GetMapping("/health")
    public ResponseEntity<?> health() {
        String dbStatus;
        try (Connection c = dataSource.getConnection()) {
            dbStatus = c.isValid(2) ? "connected" : "disconnected";
        } catch (Exception e) {
            dbStatus = "error: " + e.getMessage();
        }
        return ResponseEntity.ok(Map.of(
                "status",  "ok",
                "message", "EcoQuest API running",
                "db",      dbStatus
        ));
    }
}
