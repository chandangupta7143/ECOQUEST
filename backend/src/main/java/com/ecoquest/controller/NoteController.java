package com.ecoquest.controller;

import com.ecoquest.entity.Note;
import com.ecoquest.entity.Subject;
import com.ecoquest.entity.User;
import com.ecoquest.exception.EcoQuestException;
import com.ecoquest.repository.NoteRepository;
import com.ecoquest.repository.SubjectRepository;
import com.ecoquest.repository.UserRepository;
import com.ecoquest.security.EcoQuestUserPrincipal;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notes")
public class NoteController {

    private final NoteRepository noteRepository;
    private final UserRepository userRepository;
    private final SubjectRepository subjectRepository;

    @Value("${app.upload.dir}")
    private String uploadDir;

    public NoteController(NoteRepository noteRepository,
                          UserRepository userRepository,
                          SubjectRepository subjectRepository) {
        this.noteRepository = noteRepository;
        this.userRepository = userRepository;
        this.subjectRepository = subjectRepository;
    }

    /** GET /api/notes?class=&subject=&chapter= */
    @GetMapping
    public ResponseEntity<?> getNotes(
            @RequestParam(name = "class", required = false) String className,
            @RequestParam(required = false) String subject,
            @RequestParam(required = false) String chapter
    ) {
        List<Note> notes;
        if (className != null && !className.isBlank() && subject != null && !subject.isBlank()
                && chapter != null && !chapter.isBlank()) {
            notes = noteRepository.findByIsActiveTrueAndClassNameIgnoreCaseAndSubjectIgnoreCaseAndChapterIgnoreCaseOrderByCreatedAtDesc(
                    className, subject, chapter);
        } else if (className != null && !className.isBlank() && subject != null && !subject.isBlank()) {
            notes = noteRepository.findByIsActiveTrueAndClassNameIgnoreCaseAndSubjectIgnoreCaseOrderByCreatedAtDesc(
                    className, subject);
        } else if (className != null && !className.isBlank()) {
            notes = noteRepository.findByIsActiveTrueAndClassNameIgnoreCaseOrderByCreatedAtDesc(className);
        } else {
            notes = noteRepository.findByIsActiveTrueOrderByCreatedAtDesc();
        }
        return ResponseEntity.ok(notes);
    }

    /** POST /api/notes (teacher only) — multipart */
    @PostMapping
    public ResponseEntity<?> uploadNote(
            @AuthenticationPrincipal EcoQuestUserPrincipal principal,
            @RequestParam("title") String title,
            @RequestParam("subject") String subject,
            @RequestParam(value = "chapter", required = false) String chapter,
            @RequestParam(value = "type", required = false) String type,
            @RequestParam(value = "externalUrl", required = false) String externalUrl,
            @RequestPart(value = "file", required = false) MultipartFile file
    ) throws IOException {

        if (principal.getUser().getRole() != User.Role.teacher) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("message", "Forbidden"));
        }

        User teacher = userRepository.findById(principal.getId())
                .orElseThrow(() -> new EcoQuestException(HttpStatus.NOT_FOUND, "User not found"));

        String fileUrl = "";
        String fileOriginalName = "";

        if (file != null && !file.isEmpty()) {
            validateNoteFile(file);
            String filename = "note-" + System.currentTimeMillis() + "-" + sanitize(file.getOriginalFilename());
            Path uploadPath = Paths.get(uploadDir).toAbsolutePath();
            Files.createDirectories(uploadPath);
            Files.copy(file.getInputStream(), uploadPath.resolve(filename), StandardCopyOption.REPLACE_EXISTING);
            fileUrl = "/uploads/" + filename;
            fileOriginalName = file.getOriginalFilename();
        }

        Note.NoteType noteType = Note.NoteType.pdf;
        if (type != null) {
            try { noteType = Note.NoteType.valueOf(type); } catch (Exception e) { /* default pdf */ }
        } else if (file == null && externalUrl != null && !externalUrl.isBlank()) {
            noteType = Note.NoteType.url;
        }

        // Fetch class from subject
        String className = subjectRepository.findFirstByNameIgnoreCaseAndIsActiveTrue(subject)
                .map(Subject::getClassName)
                .orElseThrow(() -> new EcoQuestException(HttpStatus.BAD_REQUEST, "Subject not found: " + subject));

        Note note = Note.builder()
                .title(title)
                .subject(subject)
                .chapter(chapter != null ? chapter : "")
                .className(className)
                .type(noteType)
                .fileUrl(fileUrl)
                .fileOriginalName(fileOriginalName)
                .externalUrl(externalUrl != null ? externalUrl : "")
                .uploadedBy(teacher)
                .build();

        note = noteRepository.save(note);
        return ResponseEntity.status(HttpStatus.CREATED).body(note);
    }

    /** DELETE /api/notes/:id (teacher only) */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteNote(
            @AuthenticationPrincipal EcoQuestUserPrincipal principal,
            @PathVariable Long id
    ) {
        if (principal.getUser().getRole() != User.Role.teacher) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("message", "Forbidden"));
        }
        Note note = noteRepository.findById(id)
                .orElseThrow(() -> new EcoQuestException(HttpStatus.NOT_FOUND, "Note not found"));
        note.setIsActive(false);
        noteRepository.save(note);
        return ResponseEntity.ok(Map.of("message", "Note removed"));
    }

    private void validateNoteFile(MultipartFile file) {
        String name = file.getOriginalFilename() != null ? file.getOriginalFilename().toLowerCase() : "";
        if (!name.matches(".*\\.(jpg|jpeg|png|gif|webp|pdf|doc|docx|ppt|pptx|txt|xls|xlsx)$")) {
            throw new EcoQuestException(HttpStatus.BAD_REQUEST, "Only documents and images are allowed");
        }
        if (file.getSize() > 10 * 1024 * 1024) {
            throw new EcoQuestException(HttpStatus.PAYLOAD_TOO_LARGE, "File must be under 10MB");
        }
    }

    private String sanitize(String name) {
        if (name == null) return "file";
        return name.replaceAll("[^a-zA-Z0-9._-]", "_").substring(0, Math.min(80, name.length()));
    }
}
