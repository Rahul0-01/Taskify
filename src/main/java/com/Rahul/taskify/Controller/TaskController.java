package com.Rahul.taskify.Controller;

import com.Rahul.taskify.Model.Task;
import com.Rahul.taskify.Model.User;
import com.Rahul.taskify.Repository.UserRepository;
import com.Rahul.taskify.Service.TaskService;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/task")
public class TaskController {

    @Autowired
    TaskService service;

    @Autowired
    UserRepository userRepository;

    /**
     * Create a new task.
     * Optional query parameter "userId" can be used by admins to create a task for a specific user.
     */
    @PostMapping("/create")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Task> createTask(@RequestBody Task task,
                                           @RequestParam(required = false) Long userId) {
        // Priority: If assignedTo.id is provided in JSON body, use it
        if (task.getAssignedTo() != null && task.getAssignedTo().getId() != null) {
            Long assignedId = task.getAssignedTo().getId();
            User user = userRepository.findById(assignedId)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Assigned user not found"));
            task.setAssignedTo(user);
            return ResponseEntity.ok(service.createTask(task, assignedId));
        }

        // Else, fallback to query param
        if (userId != null) {
            return ResponseEntity.ok(service.createTask(task, userId));
        }

        // Default behavior (assign to authenticated user inside service)
        return ResponseEntity.ok(service.createTask(task));

    }
    /**
     * 
     * Retrieve all tasks.
     */
    @GetMapping("/getAllTask")
    @PreAuthorize("isAuthenticated()")
    public List<Task> getAllTask() {
        return service.getAllTask();
    }

    /**
     * Retrieve a specific task by its ID.
     */
    @GetMapping("/getTask/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Task> getTaskById(@PathVariable long id) {
        Task task = service.getTaskById(id);
        if (task != null) {
            return ResponseEntity.ok(task);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Update an existing task.
     */
    @PutMapping("/update/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Task> updateTask(@PathVariable long id, @RequestBody Task updatedTask) {
        Task task = service.updateTask(id, updatedTask);
        if (task != null) {
            return ResponseEntity.ok(task);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Delete a task by its ID.
     */
    @DeleteMapping("/delete/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<String> deleteTask(@PathVariable long id) {
        try {
            service.deleteTask(id);
            return ResponseEntity.ok("Task Deleted Successfully");
        } catch (EntityNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Task Not Found");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("An error occurred while deleting the task");
        }
    }

    /**
     * Get tasks by their status.
     */
    @GetMapping("/getByStatus/{status}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<Task>> getTasksByStatus(@PathVariable String status) {
        List<Task> tasks = service.getTasksByStatus(status);
        if (tasks.isEmpty()) {
            return ResponseEntity.notFound().build();
        } else {
            return ResponseEntity.ok(tasks);
        }
    }

    /**
     * Get tasks by their priority.
     */
    @GetMapping("/getByPriority/{priority}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<Task>> getTasksByPriority(@PathVariable String priority) {
        List<Task> tasks = service.getTasksByPriority(priority);
        if (tasks.isEmpty()) {
            return ResponseEntity.notFound().build();
        } else {
            return ResponseEntity.ok(tasks);
        }
    }

    /**
     * Get tasks by their due date.
     */
    @GetMapping("/getByDueDate")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<Task>> getTasksByDueDate(@RequestParam String dueDate) {
        List<Task> tasks = service.getTasksByDueDate(dueDate);
        if (tasks.isEmpty()) {
            return ResponseEntity.notFound().build();
        } else {
            return ResponseEntity.ok(tasks);
        }
    }

    /**
     * Assign a task to a user.
     */
    @PutMapping("/assign/{taskId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Task> assignTask(@PathVariable Long taskId, @RequestBody User assignedUser) {
        Task updatedTask = service.assignTaskToUser(taskId, assignedUser);
        if (updatedTask != null) {
            return ResponseEntity.ok(updatedTask);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Update the status of a task.
     */
    @PutMapping("/updateStatus/{taskId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Task> updateTaskStatus(@PathVariable Long taskId, @RequestBody String status) {
        Task updatedTask = service.updateTaskStatus(taskId, status);
        if (updatedTask != null) {
            return ResponseEntity.ok(updatedTask);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Get tasks assigned to a specific user.
     */
    @GetMapping("/getByUser/{userId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<Task>> getTasksByUser(@PathVariable Long userId) {
        List<Task> tasks = service.getTasksByUser(userId);
        if (tasks.isEmpty()) {
            return ResponseEntity.notFound().build();
        } else {
            return ResponseEntity.ok(tasks);
        }
    }

    /**
     * Get tasks within a specific date range.
     */
    @GetMapping("/getByDateRange")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<Task>> getTasksByDateRange(@RequestParam String startDate, @RequestParam String endDate) {
        List<Task> tasks = service.getTasksByDateRange(startDate, endDate);
        if (tasks.isEmpty()) {
            return ResponseEntity.notFound().build();
        } else {
            return ResponseEntity.ok(tasks);
        }
    }

    /**
     * Mark a task as completed.
     */
    @PutMapping("/markAsCompleted/{taskId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Task> markTaskAsCompleted(@PathVariable Long taskId) {
        Task updatedTask = service.markTaskAsCompleted(taskId);
        if (updatedTask != null) {
            return ResponseEntity.ok(updatedTask);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Get tasks with pagination and sorting.
     */
    @GetMapping("/getAllTaskPaged")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Page<Task>> getAllTaskPaged(
            @RequestParam int page,
            @RequestParam int size,
            @RequestParam String sortBy) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(sortBy));
        Page<Task> tasks = service.getAllTaskPaged(pageable);
        return ResponseEntity.ok(tasks);
    }
}
