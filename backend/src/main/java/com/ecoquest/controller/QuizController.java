package com.ecoquest.controller;

import com.ecoquest.dto.QuizRequest;
import com.ecoquest.dto.QuizSubmitRequest;
import com.ecoquest.entity.*;
import com.ecoquest.exception.EcoQuestException;
import com.ecoquest.repository.*;
import com.ecoquest.security.EcoQuestUserPrincipal;
import com.ecoquest.service.UserProgressService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/quizzes")
public class QuizController {

    private final QuizRepository quizRepository;
    private final UserRepository userRepository;
    private final SubjectRepository subjectRepository;
    private final QuizAttemptRepository attemptRepository;
    private final UserProgressService progressService;

    public QuizController(QuizRepository quizRepository,
                          UserRepository userRepository,
                          SubjectRepository subjectRepository,
                          QuizAttemptRepository attemptRepository,
                          UserProgressService progressService) {
        this.quizRepository = quizRepository;
        this.userRepository = userRepository;
        this.subjectRepository = subjectRepository;
        this.attemptRepository = attemptRepository;
        this.progressService = progressService;
    }

    /** GET /api/quizzes?class=&subject= */
    @GetMapping
    public ResponseEntity<?> getQuizzes(
            @RequestParam(name = "class", required = false) String className,
            @RequestParam(required = false) String subject
    ) {
        List<Quiz> quizzes;
        if (className != null && !className.isBlank() && subject != null && !subject.isBlank()) {
            quizzes = quizRepository.findByIsActiveTrueAndClassNameIgnoreCaseAndSubjectIgnoreCase(className, subject);
        } else if (className != null && !className.isBlank()) {
            quizzes = quizRepository.findByIsActiveTrueAndClassNameIgnoreCase(className);
        } else {
            quizzes = quizRepository.findByIsActiveTrue();
        }
        return ResponseEntity.ok(quizzes);
    }

    /** GET /api/quizzes/:id */
    @GetMapping("/{id}")
    public ResponseEntity<?> getQuiz(
            @AuthenticationPrincipal EcoQuestUserPrincipal principal,
            @PathVariable Long id
    ) {
        Quiz quiz = quizRepository.findById(id)
                .orElseThrow(() -> new EcoQuestException(HttpStatus.NOT_FOUND, "Quiz not found"));

        // Block student if they already attempted this quiz
        if (principal != null && principal.getUser().getRole() == User.Role.student) {
            if (attemptRepository.existsByStudentIdAndQuizId(principal.getId(), id)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(Map.of("message", "You have already attempted this test. Reattempt is not allowed."));
            }
        }
        return ResponseEntity.ok(quiz);
    }

    /** POST /api/quizzes (teacher only) */
    @PostMapping
    @Transactional
    public ResponseEntity<?> createQuiz(
            @AuthenticationPrincipal EcoQuestUserPrincipal principal,
            @RequestBody QuizRequest req
    ) {
        if (principal.getUser().getRole() != User.Role.teacher) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("message", "Forbidden"));
        }
        User teacher = userRepository.findById(principal.getId())
                .orElseThrow(() -> new EcoQuestException(HttpStatus.NOT_FOUND, "User not found"));

        // Fetch class from subject
        String className = subjectRepository.findFirstByNameIgnoreCaseAndIsActiveTrue(req.getSubject())
                .map(Subject::getClassName)
                .orElseThrow(() -> new EcoQuestException(HttpStatus.BAD_REQUEST, "Subject not found: " + req.getSubject()));

        Quiz quiz = Quiz.builder()
                .title(req.getTitle())
                .subject(req.getSubject())
                .chapter(req.getChapter())
                .className(className)
                .xpReward(req.getXpReward() != null ? req.getXpReward() : 100)
                .createdBy(teacher)
                .build();

        if (req.getQuestions() != null) {
            List<QuizQuestion> questions = new ArrayList<>();
            for (int i = 0; i < req.getQuestions().size(); i++) {
                QuizRequest.QuestionDto dto = req.getQuestions().get(i);
                QuizQuestion q = QuizQuestion.builder()
                        .question(dto.getQuestion())
                        .options(dto.getOptions() != null ? dto.getOptions() : new ArrayList<>())
                        .correctIndex(dto.getCorrectIndex())
                        .explanation(dto.getExplanation())
                        .questionOrder(i)
                        .quiz(quiz)
                        .build();
                questions.add(q);
            }
            quiz.setQuestions(questions);
        }

        Quiz saved = quizRepository.save(quiz);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    /** PUT /api/quizzes/:id (teacher only) */
    @PutMapping("/{id}")
    @Transactional
    public ResponseEntity<?> updateQuiz(
            @AuthenticationPrincipal EcoQuestUserPrincipal principal,
            @PathVariable Long id,
            @RequestBody QuizRequest req
    ) {
        if (principal.getUser().getRole() != User.Role.teacher) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("message", "Forbidden"));
        }
        Quiz quiz = quizRepository.findById(id)
                .orElseThrow(() -> new EcoQuestException(HttpStatus.NOT_FOUND, "Quiz not found"));

        if (req.getTitle() != null)     quiz.setTitle(req.getTitle());
        if (req.getSubject() != null) {
            quiz.setSubject(req.getSubject());
            // Update class if subject changed
            subjectRepository.findFirstByNameIgnoreCaseAndIsActiveTrue(req.getSubject())
                    .ifPresent(s -> quiz.setClassName(s.getClassName()));
        }
        if (req.getChapter() != null)   quiz.setChapter(req.getChapter());
        if (req.getXpReward() != null)  quiz.setXpReward(req.getXpReward());

        if (req.getQuestions() != null) {
            quiz.getQuestions().clear();
            for (int i = 0; i < req.getQuestions().size(); i++) {
                QuizRequest.QuestionDto dto = req.getQuestions().get(i);
                QuizQuestion q = QuizQuestion.builder()
                        .question(dto.getQuestion())
                        .options(dto.getOptions() != null ? dto.getOptions() : new ArrayList<>())
                        .correctIndex(dto.getCorrectIndex())
                        .explanation(dto.getExplanation())
                        .questionOrder(i)
                        .quiz(quiz)
                        .build();
                quiz.getQuestions().add(q);
            }
        }

        Quiz saved = quizRepository.save(quiz);
        return ResponseEntity.ok(saved);
    }

    /** DELETE /api/quizzes/:id (teacher only) — soft delete */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteQuiz(
            @AuthenticationPrincipal EcoQuestUserPrincipal principal,
            @PathVariable Long id
    ) {
        if (principal.getUser().getRole() != User.Role.teacher) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("message", "Forbidden"));
        }
        Quiz quiz = quizRepository.findById(id)
                .orElseThrow(() -> new EcoQuestException(HttpStatus.NOT_FOUND, "Quiz not found"));
        quiz.setIsActive(false);
        quizRepository.save(quiz);
        return ResponseEntity.ok(Map.of("message", "Quiz deactivated"));
    }

    /** POST /api/quizzes/:id/submit (student) */
    @PostMapping("/{id}/submit")
    @Transactional
    public ResponseEntity<?> submitQuiz(
            @AuthenticationPrincipal EcoQuestUserPrincipal principal,
            @PathVariable Long id,
            @RequestBody QuizSubmitRequest req
    ) {
        if (attemptRepository.existsByStudentIdAndQuizId(principal.getId(), id)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("message", "You have already attempted this test. Reattempt is not allowed."));
        }
        Quiz quiz = quizRepository.findById(id)
                .orElseThrow(() -> new EcoQuestException(HttpStatus.NOT_FOUND, "Quiz not found"));

        List<Integer> answers = req.getAnswers();
        List<QuizQuestion> questions = quiz.getQuestions();

        int correct = 0;
        List<Map<String, Object>> results = new ArrayList<>();
        for (int i = 0; i < questions.size(); i++) {
            QuizQuestion q = questions.get(i);
            Integer selected = (answers != null && i < answers.size()) ? answers.get(i) : -1;
            boolean isCorrect = selected != null && selected.equals(q.getCorrectIndex());
            if (isCorrect) correct++;
            results.add(Map.of(
                    "question",     q.getQuestion(),
                    "isCorrect",    isCorrect,
                    "correctIndex", q.getCorrectIndex() != null ? q.getCorrectIndex() : 0,
                    "explanation",  q.getExplanation() != null ? q.getExplanation() : ""
            ));
        }

        int total    = questions.size();
        int score    = total > 0 ? Math.round((float) correct / total * 100) : 0;
        int xpEarned = (int) Math.round((double) score / 100 * quiz.getXpReward());

        // Update student XP
        User student = userRepository.findById(principal.getId())
                .orElseThrow(() -> new EcoQuestException(HttpStatus.NOT_FOUND, "Student not found"));
        student.setXp(student.getXp() + xpEarned);
        userRepository.save(student);

        // Save attempt
        QuizAttempt attempt = QuizAttempt.builder()
                .student(student)
                .quiz(quiz)
                .score(score)
                .xpEarned(xpEarned)
                .correct(correct)
                .total(total)
                .build();
        attemptRepository.save(attempt);

        // Update progress / badges
        progressService.updateProgress(principal.getId());

        return ResponseEntity.ok(Map.of(
                "score",    score,
                "correct",  correct,
                "total",    total,
                "xpEarned", xpEarned,
                "results",  results
        ));
    }
    @GetMapping("/attempts")
    public ResponseEntity<?> getMyAttempts(@AuthenticationPrincipal EcoQuestUserPrincipal principal) {
        if (principal == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        return ResponseEntity.ok(attemptRepository.findByStudentIdOrderByCreatedAtDesc(principal.getId()));
    }
}
