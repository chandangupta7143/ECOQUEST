package com.ecoquest.controller;

import com.ecoquest.dto.TaskRequest;
import com.ecoquest.entity.Task;
import com.ecoquest.entity.User;
import com.ecoquest.exception.EcoQuestException;
import com.ecoquest.repository.TaskRepository;
import com.ecoquest.repository.UserRepository;
import com.ecoquest.security.EcoQuestUserPrincipal;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/tasks")
public class TaskController {

    private final TaskRepository taskRepository;
    private final UserRepository userRepository;

    public TaskController(TaskRepository taskRepository, UserRepository userRepository) {
        this.taskRepository = taskRepository;
        this.userRepository = userRepository;
    }

    /** GET /api/tasks?category=&type= */
    @GetMapping
    public ResponseEntity<?> getTasks(
            @AuthenticationPrincipal EcoQuestUserPrincipal principal,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String type
    ) {
        List<Task> tasks;
        String userClass = null;
        
        // If student, only show tasks for their class
        if (principal != null && principal.getUser().getRole() == User.Role.student) {
            userClass = principal.getUser().getClassName();
        }

        try {
            if (userClass != null) {
                if (category != null && type != null) {
                    tasks = taskRepository.findByIsActiveTrueAndClassNameIgnoreCaseAndCategoryAndType(
                            userClass, Task.Category.valueOf(category), Task.TaskType.valueOf(type));
                } else if (category != null) {
                    tasks = taskRepository.findByIsActiveTrueAndClassNameIgnoreCaseAndCategory(userClass, Task.Category.valueOf(category));
                } else if (type != null) {
                    tasks = taskRepository.findByIsActiveTrueAndClassNameIgnoreCaseAndType(userClass, Task.TaskType.valueOf(type));
                } else {
                    tasks = taskRepository.findByIsActiveTrueAndClassNameIgnoreCase(userClass);
                }
            } else {
                // Teacher or admin (see all)
                if (category != null && type != null) {
                    tasks = taskRepository.findByIsActiveTrueAndCategoryAndType(
                            Task.Category.valueOf(category), Task.TaskType.valueOf(type));
                } else if (category != null) {
                    tasks = taskRepository.findByIsActiveTrueAndCategory(Task.Category.valueOf(category));
                } else if (type != null) {
                    tasks = taskRepository.findByIsActiveTrueAndType(Task.TaskType.valueOf(type));
                } else {
                    tasks = taskRepository.findByIsActiveTrue();
                }
            }
        } catch (IllegalArgumentException e) {
            tasks = userClass != null ? taskRepository.findByIsActiveTrueAndClassNameIgnoreCase(userClass) : taskRepository.findByIsActiveTrue();
        }
        return ResponseEntity.ok(tasks);
    }

    /** POST /api/tasks (teacher only) */
    @PostMapping
    public ResponseEntity<?> createTask(
            @AuthenticationPrincipal EcoQuestUserPrincipal principal,
            @RequestBody TaskRequest req
    ) {
        if (principal.getUser().getRole() != User.Role.teacher) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("message", "Forbidden"));
        }
        User teacher = userRepository.findById(principal.getId())
                .orElseThrow(() -> new EcoQuestException(HttpStatus.NOT_FOUND, "User not found"));

        Task task = Task.builder()
                .title(req.getTitle())
                .description(req.getDescription())
                .category(Task.Category.valueOf(req.getCategory()))
                .type(req.getType() != null ? Task.TaskType.valueOf(req.getType()) : Task.TaskType.daily)
                .xpReward(req.getXpReward() != null ? req.getXpReward() : 50)
                .className(req.getClassName())
                .createdBy(teacher)
                .build();

        task = taskRepository.save(task);
        return ResponseEntity.status(HttpStatus.CREATED).body(task);
    }

    /** DELETE /api/tasks/:id (teacher only) */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteTask(
            @AuthenticationPrincipal EcoQuestUserPrincipal principal,
            @PathVariable Long id
    ) {
        if (principal.getUser().getRole() != User.Role.teacher) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("message", "Forbidden"));
        }
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new EcoQuestException(HttpStatus.NOT_FOUND, "Task not found"));
        task.setIsActive(false);
        taskRepository.save(task);
        return ResponseEntity.ok(Map.of("message", "Task deactivated"));
    }
}
