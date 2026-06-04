package com.ecoquest.repository;

import com.ecoquest.entity.Submission;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SubmissionRepository extends JpaRepository<Submission, Long> {
    List<Submission> findByStudentIdOrderByCreatedAtDesc(Long studentId);
    List<Submission> findByStatusOrderByCreatedAtDesc(Submission.SubmissionStatus status);
    List<Submission> findAllByOrderByCreatedAtDesc();
}
