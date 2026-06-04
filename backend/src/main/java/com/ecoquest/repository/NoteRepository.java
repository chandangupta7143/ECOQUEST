package com.ecoquest.repository;

import com.ecoquest.entity.Note;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NoteRepository extends JpaRepository<Note, Long> {
    List<Note> findByIsActiveTrueOrderByCreatedAtDesc();
    List<Note> findByIsActiveTrueAndClassNameIgnoreCaseOrderByCreatedAtDesc(String className);
    List<Note> findByIsActiveTrueAndClassNameIgnoreCaseAndSubjectIgnoreCaseOrderByCreatedAtDesc(String className, String subject);
    List<Note> findByIsActiveTrueAndClassNameIgnoreCaseAndSubjectIgnoreCaseAndChapterIgnoreCaseOrderByCreatedAtDesc(
            String className, String subject, String chapter);

    @Modifying
    @Query("UPDATE Note n SET n.isActive = false WHERE n.subject = :subject")
    void deactivateBySubject(String subject);

    @Modifying
    @Query("UPDATE Note n SET n.isActive = false WHERE n.subject = :subject AND LOWER(n.chapter) = LOWER(:chapter)")
    void deactivateBySubjectAndChapter(String subject, String chapter);
}
