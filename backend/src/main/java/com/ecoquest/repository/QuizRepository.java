package com.ecoquest.repository;

import com.ecoquest.entity.Quiz;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface QuizRepository extends JpaRepository<Quiz, Long> {
    List<Quiz> findByIsActiveTrueAndClassNameIgnoreCase(String className);
    List<Quiz> findByIsActiveTrueAndClassNameIgnoreCaseAndSubjectIgnoreCase(String className, String subject);
    List<Quiz> findByIsActiveTrue();

    @Modifying
    @Query("UPDATE Quiz q SET q.isActive = false WHERE q.subject = :subject")
    void deactivateBySubject(String subject);

    @Modifying
    @Query("UPDATE Quiz q SET q.isActive = false WHERE q.subject = :subject AND LOWER(q.chapter) = LOWER(:chapter)")
    void deactivateBySubjectAndChapter(String subject, String chapter);
}
