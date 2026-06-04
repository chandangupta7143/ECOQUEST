package com.ecoquest.repository;

import com.ecoquest.entity.QuizAttempt;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface QuizAttemptRepository extends JpaRepository<QuizAttempt, Long> {
    List<QuizAttempt> findByStudentIdOrderByCreatedAtDesc(Long studentId);
    List<QuizAttempt> findAllByOrderByCreatedAtDesc();
    boolean existsByStudentIdAndQuizId(Long studentId, Long quizId);
}
