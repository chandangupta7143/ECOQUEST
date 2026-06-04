package com.ecoquest.repository;

import com.ecoquest.entity.Task;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TaskRepository extends JpaRepository<Task, Long> {
    List<Task> findByIsActiveTrue();
    List<Task> findByIsActiveTrueAndCategory(Task.Category category);
    List<Task> findByIsActiveTrueAndType(Task.TaskType type);
    List<Task> findByIsActiveTrueAndCategoryAndType(Task.Category category, Task.TaskType type);
    
    // Class-specific filters
    List<Task> findByIsActiveTrueAndClassNameIgnoreCase(String className);
    List<Task> findByIsActiveTrueAndClassNameIgnoreCaseAndCategory(String className, Task.Category category);
    List<Task> findByIsActiveTrueAndClassNameIgnoreCaseAndType(String className, Task.TaskType type);
    List<Task> findByIsActiveTrueAndClassNameIgnoreCaseAndCategoryAndType(String className, Task.Category category, Task.TaskType type);
}
