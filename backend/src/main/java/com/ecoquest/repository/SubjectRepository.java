package com.ecoquest.repository;

import com.ecoquest.entity.Subject;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SubjectRepository extends JpaRepository<Subject, Long> {
    List<Subject> findByIsActiveTrueOrderByCreatedAtAsc();
    List<Subject> findByIsActiveTrueAndClassNameOrderByCreatedAtAsc(String className);
    Optional<Subject> findFirstByNameIgnoreCaseAndIsActiveTrue(String name);
    void deleteByNameAndIsActive(String name, boolean isActive);
}
