package com.ecoquest.controller;

import com.ecoquest.dto.AuthResponse;
import com.ecoquest.entity.*;
import com.ecoquest.repository.*;
import com.ecoquest.security.EcoQuestUserPrincipal;
import com.ecoquest.service.AuthService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;

@RestController
@RequestMapping("/api/analytics")
public class AnalyticsController {

    private final UserRepository userRepository;
    private final SubmissionRepository submissionRepository;
    private final QuizAttemptRepository attemptRepository;
    private final TaskRepository taskRepository;
    private final QuizRepository quizRepository;

    public AnalyticsController(UserRepository userRepository,
                                SubmissionRepository submissionRepository,
                                QuizAttemptRepository attemptRepository,
                                TaskRepository taskRepository,
                                QuizRepository quizRepository) {
        this.userRepository = userRepository;
        this.submissionRepository = submissionRepository;
        this.attemptRepository = attemptRepository;
        this.taskRepository = taskRepository;
        this.quizRepository = quizRepository;
    }

    /** GET /api/analytics/student */
    @GetMapping("/student")
    public ResponseEntity<?> studentAnalytics(@AuthenticationPrincipal EcoQuestUserPrincipal principal) {
        Long studentId = principal.getId();
        User user = userRepository.findById(studentId).orElse(null);
        List<Submission> submissions = submissionRepository.findByStudentIdOrderByCreatedAtDesc(studentId);
        List<QuizAttempt> attempts   = attemptRepository.findByStudentIdOrderByCreatedAtDesc(studentId);

        // XP per day (last 14 days)
        Map<String, Integer> xpByDay = buildDayMap(14);
        submissions.stream()
                .filter(s -> s.getStatus() == Submission.SubmissionStatus.approved)
                .forEach(s -> addToDay(xpByDay, s.getCreatedAt(), s.getXpAwarded()));
        attempts.forEach(a -> addToDay(xpByDay, a.getCreatedAt(), a.getXpEarned()));
        List<Map<String, Object>> xpChart = toChart(xpByDay, "xp");

        // Category stats
        String[] categories = {"waste", "water", "energy", "cleanliness", "plantation"};
        Map<String, Integer> categoryStats = new LinkedHashMap<>();
        for (String cat : categories) {
            long total    = submissions.stream().filter(s -> cat.equals(getCat(s))).count();
            long approved = submissions.stream().filter(s -> cat.equals(getCat(s)) && s.getStatus() == Submission.SubmissionStatus.approved).count();
            categoryStats.put(cat, total > 0 ? (int) Math.round((double) approved / total * 100) : 0);
        }

        List<Map<String, Object>> categoryDist = new ArrayList<>();
        for (String cat : categories) {
            long count = submissions.stream().filter(s -> cat.equals(getCat(s))).count();
            if (count > 0) categoryDist.add(mapOf("name", cat, "value", count));
        }

        long approved = submissions.stream().filter(s -> s.getStatus() == Submission.SubmissionStatus.approved).count();
        long pending  = submissions.stream().filter(s -> s.getStatus() == Submission.SubmissionStatus.pending).count();
        double avgScore = attempts.stream().mapToInt(QuizAttempt::getScore).average().orElse(0);

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("user",                AuthService.toUserDto(user));
        result.put("totalSubmissions",    submissions.size());
        result.put("approvedSubmissions", approved);
        result.put("pendingSubmissions",  pending);
        result.put("totalQuizAttempts",   attempts.size());
        result.put("avgQuizScore",        (int) Math.round(avgScore));
        result.put("xpChart",             xpChart);
        result.put("categoryStats",       categoryStats);
        result.put("categoryDist",        categoryDist);
        result.put("recentSubmissions",   submissions.stream().limit(5).toList());
        result.put("recentAttempts",      attempts.stream().limit(5).toList());
        return ResponseEntity.ok(result);
    }

    /** GET /api/analytics/teacher */
    @GetMapping("/teacher")
    public ResponseEntity<?> teacherAnalytics(@AuthenticationPrincipal EcoQuestUserPrincipal principal) {
        if (principal.getUser().getRole() != User.Role.teacher) {
            return ResponseEntity.status(403).body(Map.of("message", "Forbidden"));
        }

        List<User>        students    = userRepository.findByRoleOrderByXpDesc(User.Role.student);
        List<Submission>  submissions = submissionRepository.findAllByOrderByCreatedAtDesc();
        List<Task>        tasks       = taskRepository.findByIsActiveTrue();
        List<Quiz>        quizzes     = quizRepository.findByIsActiveTrue();

        // Submissions per day
        Map<String, Integer> submsByDay = buildDayMap(14);
        submissions.forEach(s -> addToDay(submsByDay, s.getCreatedAt(), 1));
        List<Map<String, Object>> activityChart = toChart(submsByDay, "count");

        // Category distribution
        String[] categories = {"waste", "water", "energy", "cleanliness", "plantation"};
        List<Map<String, Object>> categoryDist = new ArrayList<>();
        for (String cat : categories) {
            long count = submissions.stream().filter(s -> cat.equals(getCat(s))).count();
            if (count > 0) categoryDist.add(mapOf("name", cat, "value", count));
        }

        // Status breakdown
        List<Map<String, Object>> statusDist = new ArrayList<>();
        long approvedCount = submissions.stream().filter(s -> s.getStatus() == Submission.SubmissionStatus.approved).count();
        long pendingCount  = submissions.stream().filter(s -> s.getStatus() == Submission.SubmissionStatus.pending).count();
        long rejectedCount = submissions.stream().filter(s -> s.getStatus() == Submission.SubmissionStatus.rejected).count();
        if (approvedCount > 0) statusDist.add(mapOf("name", "Approved", "value", approvedCount));
        if (pendingCount  > 0) statusDist.add(mapOf("name", "Pending",  "value", pendingCount));
        if (rejectedCount > 0) statusDist.add(mapOf("name", "Rejected", "value", rejectedCount));

        double avgXp = students.stream().mapToInt(User::getXp).average().orElse(0);
        List<AuthResponse.UserDto> topStudentDtos = students.stream().limit(10).map(AuthService::toUserDto).toList();

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("totalStudents",    students.size());
        result.put("totalSubmissions", submissions.size());
        result.put("pendingReviews",   pendingCount);
        result.put("approvedCount",    approvedCount);
        result.put("totalTasks",       tasks.size());
        result.put("totalQuizzes",     quizzes.size());
        result.put("avgXP",            (int) Math.round(avgXp));
        result.put("topStudents",      topStudentDtos);
        result.put("activityChart",    activityChart);
        result.put("categoryDist",     categoryDist);
        result.put("statusDist",       statusDist);
        result.put("recentSubmissions",submissions.stream().limit(10).toList());
        return ResponseEntity.ok(result);
    }

    // ── Helpers ─────────────────────────────────────────────────────────────
    private Map<String, Integer> buildDayMap(int days) {
        Map<String, Integer> map = new LinkedHashMap<>();
        for (int i = days - 1; i >= 0; i--) {
            String key = LocalDate.now().minusDays(i).toString().substring(5);
            map.put(key, 0);
        }
        return map;
    }

    private void addToDay(Map<String, Integer> map, LocalDateTime dt, Integer value) {
        if (dt == null || value == null) return;
        String key = dt.toLocalDate().toString().substring(5);
        map.computeIfPresent(key, (k, v) -> v + value);
    }

    private List<Map<String, Object>> toChart(Map<String, Integer> map, String valueKey) {
        List<Map<String, Object>> list = new ArrayList<>();
        map.forEach((date, val) -> {
            Map<String, Object> entry = new LinkedHashMap<>();
            entry.put("date", date);
            entry.put(valueKey, val);
            list.add(entry);
        });
        return list;
    }

    private String getCat(Submission s) {
        if (s.getTask() == null || s.getTask().getCategory() == null) return "";
        return s.getTask().getCategory().name();
    }

    private Map<String, Object> mapOf(String k1, Object v1, String k2, Object v2) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put(k1, v1); m.put(k2, v2);
        return m;
    }
}
