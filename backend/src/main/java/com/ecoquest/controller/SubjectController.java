package com.ecoquest.controller;

import com.ecoquest.entity.Chapter;
import com.ecoquest.entity.Subject;
import com.ecoquest.entity.User;
import com.ecoquest.exception.EcoQuestException;
import com.ecoquest.repository.*;
import com.ecoquest.security.EcoQuestUserPrincipal;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/subjects")
public class SubjectController {

    private final SubjectRepository subjectRepository;
    private final UserRepository userRepository;
    private final QuizRepository quizRepository;
    private final NoteRepository noteRepository;

    public SubjectController(SubjectRepository subjectRepository,
                              UserRepository userRepository,
                              QuizRepository quizRepository,
                              NoteRepository noteRepository) {
        this.subjectRepository = subjectRepository;
        this.userRepository = userRepository;
        this.quizRepository = quizRepository;
        this.noteRepository = noteRepository;
    }

    /** GET /api/subjects?class= */
    @GetMapping
    public ResponseEntity<?> getSubjects(
            @AuthenticationPrincipal EcoQuestUserPrincipal principal,
            @RequestParam(name = "class", required = false) String className
    ) {
        List<Subject> subjects;
        // Teachers see all; students filter by class
        if (principal.getUser().getRole() == User.Role.teacher
                || className == null || className.isBlank()) {
            subjects = subjectRepository.findByIsActiveTrueOrderByCreatedAtAsc();
        } else {
            subjects = subjectRepository.findByIsActiveTrueAndClassNameOrderByCreatedAtAsc(className);
        }
        return ResponseEntity.ok(subjects);
    }

    /** POST /api/subjects (teacher only) */
    @PostMapping
    public ResponseEntity<?> createSubject(
            @AuthenticationPrincipal EcoQuestUserPrincipal principal,
            @RequestBody Map<String, String> body
    ) {
        if (principal.getUser().getRole() != User.Role.teacher) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("message", "Forbidden"));
        }
        User teacher = userRepository.findById(principal.getId())
                .orElseThrow(() -> new EcoQuestException(HttpStatus.NOT_FOUND, "User not found"));

        Subject subject = Subject.builder()
                .name(body.get("name"))
                .className(body.getOrDefault("class", ""))
                .createdBy(teacher)
                .build();
        subject = subjectRepository.save(subject);
        return ResponseEntity.status(HttpStatus.CREATED).body(subject);
    }

    /** PUT /api/subjects/:id (teacher only) */
    @PutMapping("/{id}")
    public ResponseEntity<?> updateSubject(
            @AuthenticationPrincipal EcoQuestUserPrincipal principal,
            @PathVariable Long id,
            @RequestBody Map<String, String> body
    ) {
        if (principal.getUser().getRole() != User.Role.teacher) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("message", "Forbidden"));
        }
        Subject subject = subjectRepository.findById(id)
                .orElseThrow(() -> new EcoQuestException(HttpStatus.NOT_FOUND, "Subject not found"));
        if (body.get("name") != null) subject.setName(body.get("name"));
        subject = subjectRepository.save(subject);
        return ResponseEntity.ok(subject);
    }

    /** DELETE /api/subjects/:id (teacher only) — cascades to quizzes & notes */
    @DeleteMapping("/{id}")
    @Transactional
    public ResponseEntity<?> deleteSubject(
            @AuthenticationPrincipal EcoQuestUserPrincipal principal,
            @PathVariable Long id
    ) {
        if (principal.getUser().getRole() != User.Role.teacher) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("message", "Forbidden"));
        }
        Subject subject = subjectRepository.findById(id)
                .orElseThrow(() -> new EcoQuestException(HttpStatus.NOT_FOUND, "Subject not found"));

        // Cascade deactivation
        quizRepository.deactivateBySubject(subject.getName());
        noteRepository.deactivateBySubject(subject.getName());
        subject.setIsActive(false);
        subjectRepository.save(subject);
        return ResponseEntity.ok(Map.of("message", "Deleted"));
    }

    /** POST /api/subjects/:id/chapters */
    @PostMapping("/{id}/chapters")
    public ResponseEntity<?> addChapter(
            @AuthenticationPrincipal EcoQuestUserPrincipal principal,
            @PathVariable Long id,
            @RequestBody Map<String, String> body
    ) {
        if (principal.getUser().getRole() != User.Role.teacher) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("message", "Forbidden"));
        }
        Subject subject = subjectRepository.findById(id)
                .orElseThrow(() -> new EcoQuestException(HttpStatus.NOT_FOUND, "Subject not found"));

        Chapter chapter = Chapter.builder()
                .name(body.get("name"))
                .chapterOrder(subject.getChapters().size())
                .subject(subject)
                .build();
        subject.getChapters().add(chapter);
        subject = subjectRepository.save(subject);
        return ResponseEntity.ok(subject);
    }

    /** PUT /api/subjects/:id/chapters/:chid */
    @PutMapping("/{id}/chapters/{chid}")
    public ResponseEntity<?> updateChapter(
            @AuthenticationPrincipal EcoQuestUserPrincipal principal,
            @PathVariable Long id,
            @PathVariable Long chid,
            @RequestBody Map<String, String> body
    ) {
        if (principal.getUser().getRole() != User.Role.teacher) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("message", "Forbidden"));
        }
        Subject subject = subjectRepository.findById(id)
                .orElseThrow(() -> new EcoQuestException(HttpStatus.NOT_FOUND, "Subject not found"));

        Chapter chapter = subject.getChapters().stream()
                .filter(c -> c.getId().equals(chid))
                .findFirst()
                .orElseThrow(() -> new EcoQuestException(HttpStatus.NOT_FOUND, "Chapter not found"));

        chapter.setName(body.get("name"));
        subject = subjectRepository.save(subject);
        return ResponseEntity.ok(subject);
    }

    /** DELETE /api/subjects/:id/chapters/:chid — cascades to quizzes & notes */
    @DeleteMapping("/{id}/chapters/{chid}")
    @Transactional
    public ResponseEntity<?> deleteChapter(
            @AuthenticationPrincipal EcoQuestUserPrincipal principal,
            @PathVariable Long id,
            @PathVariable Long chid
    ) {
        if (principal.getUser().getRole() != User.Role.teacher) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("message", "Forbidden"));
        }
        Subject subject = subjectRepository.findById(id)
                .orElseThrow(() -> new EcoQuestException(HttpStatus.NOT_FOUND, "Subject not found"));

        Chapter chapter = subject.getChapters().stream()
                .filter(c -> c.getId().equals(chid))
                .findFirst()
                .orElseThrow(() -> new EcoQuestException(HttpStatus.NOT_FOUND, "Chapter not found"));

        // Cascade deactivation of quizzes & notes for this chapter
        quizRepository.deactivateBySubjectAndChapter(subject.getName(), chapter.getName());
        noteRepository.deactivateBySubjectAndChapter(subject.getName(), chapter.getName());

        subject.getChapters().remove(chapter);
        subject = subjectRepository.save(subject);
        return ResponseEntity.ok(subject);
    }
}
