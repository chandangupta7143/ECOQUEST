package com.ecoquest;

import org.junit.jupiter.api.Test;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

public class BCryptBenchmarkTest {

    @Test
    public void benchmarkBCrypt() {
        String rawPassword = "Password123!";

        // Warm up JIT
        BCryptPasswordEncoder encoder10 = new BCryptPasswordEncoder(10);
        encoder10.encode("warmup");

        // Benchmark Strength 12
        BCryptPasswordEncoder encoder12 = new BCryptPasswordEncoder(12);
        long start12 = System.nanoTime();
        String hash12 = encoder12.encode(rawPassword);
        long time12 = (System.nanoTime() - start12) / 1_000_000;

        // Verify with Strength 12
        long startVerify12 = System.nanoTime();
        boolean match12 = encoder12.matches(rawPassword, hash12);
        long timeVerify12 = (System.nanoTime() - startVerify12) / 1_000_000;

        // Benchmark Strength 10
        long start10 = System.nanoTime();
        String hash10 = encoder10.encode(rawPassword);
        long time10 = (System.nanoTime() - start10) / 1_000_000;

        // Verify with Strength 10
        long startVerify10 = System.nanoTime();
        boolean match10 = encoder10.matches(rawPassword, hash10);
        long timeVerify10 = (System.nanoTime() - startVerify10) / 1_000_000;

        System.out.println("=== BCrypt Benchmark Results ===");
        System.out.println("BCrypt(12) encode: " + time12 + " ms | verify: " + timeVerify12 + " ms (match: " + match12 + ")");
        System.out.println("BCrypt(10) encode: " + time10 + " ms | verify: " + timeVerify10 + " ms (match: " + match10 + ")");
    }
}
