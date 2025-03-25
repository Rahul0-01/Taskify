package com.Rahul.taskify.Controller;

import com.Rahul.taskify.Model.Task;
import com.Rahul.taskify.Model.User;
import com.Rahul.taskify.Service.TaskService;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@RestController
@RequestMapping("/api/task")
public class TaskController {

    @Autowired
    TaskService service; // Injecting TaskService to handle the business logic

    /**
     * Create a new task.
     * @param task The task object to be created.
     * @return The created task.
     */
    @PostMapping("/create")
    @PreAuthorize("isAuthenticated()") // Ensures only authenticated users can create a task
    public ResponseEntity<Task> createTask(@RequestBody Task task) {
        Task createdTask = service.createTask(task); // Calling service to create the task
        return ResponseEntity.ok(createdTask); // Returning the created task with HTTP 200 status
    }

    /**
     * Retrieve all tasks.
     * @return A list of all tasks.
     */
    @GetMapping("/getAllTask")
    @PreAuthorize("isAuthenticated()") // Ensures only authenticated users can access this
    public List<Task> getAllTask() {
        return service.getAllTask(); // Calling service to get all tasks
    }

    /**
     * Retrieve a specific task by its ID.
     * @param id The ID of the task.
     * @return The task if found, otherwise 404 Not Found.
     */
    @GetMapping("/getTask/{id}")
    @PreAuthorize("isAuthenticated()") // Ensures only authenticated users can access this
    public ResponseEntity<Task> getTaskById(@PathVariable long id) {
        Task task = service.getTaskById(id); // Calling service to get the task by ID
        if (task != null) {
            return ResponseEntity.ok(task); // Returning the task if found
        } else {
            return ResponseEntity.notFound().build(); // Returning 404 if task not found
        }
    }

    /**
     * Update an existing task.
     * @param id The ID of the task to update.
     * @param updatedTask The updated task object.
     * @return The updated task if successful, otherwise 404 Not Found.
     */
    @PutMapping("/update/{id}")
    @PreAuthorize("isAuthenticated()") // Ensures only authenticated users can update the task
    public ResponseEntity<Task> updateTask(@PathVariable long id, @RequestBody Task updatedTask) {
        Task task = service.updateTask(id, updatedTask); // Calling service to update the task
        if (task != null) {
            return ResponseEntity.ok(task); // Returning the updated task
        } else {
            return ResponseEntity.notFound().build(); // Returning 404 if task not found
        }
    }

    /**
     * Delete a task by its ID.
     * @param id The ID of the task to delete.
     * @return A success message if deleted, otherwise an error message.
     */
    @DeleteMapping("/delete/{id}")
    @PreAuthorize("isAuthenticated()") // Ensures only authenticated users can delete the task
    public ResponseEntity<String> deleteTask(@PathVariable long id) {
        try {
            service.deleteTask(id); // Calling service to delete the task
            return ResponseEntity.ok("Task Deleted Successfully"); // Returning success message
        } catch (EntityNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Task Not Found"); // Returning error if task not found
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("An error occurred while deleting the task"); // Generic error message
        }
    }

    /**
     * Get tasks by their status.
     * @param status The status of tasks to filter by.
     * @return A list of tasks with the specified status.
     */
    @GetMapping("/getByStatus/{status}")
    @PreAuthorize("isAuthenticated()") // Ensures only authenticated users can access this
    public ResponseEntity<List<Task>> getTasksByStatus(@PathVariable String status) {
        List<Task> tasks = service.getTasksByStatus(status); // Calling service to get tasks by status
        if (tasks.isEmpty()) {
            return ResponseEntity.notFound().build(); // Returning 404 if no tasks are found
        } else {
            return ResponseEntity.ok(tasks); // Returning the list of tasks
        }
    }

    /**
     * Get tasks by their priority.
     * @param priority The priority of tasks to filter by.
     * @return A list of tasks with the specified priority.
     */
    @GetMapping("/getByPriority/{priority}")
    @PreAuthorize("isAuthenticated()") // Ensures only authenticated users can access this
    public ResponseEntity<List<Task>> getTasksByPriority(@PathVariable String priority) {
        List<Task> tasks = service.getTasksByPriority(priority); // Calling service to get tasks by priority
        if (tasks.isEmpty()) {
            return ResponseEntity.notFound().build(); // Returning 404 if no tasks are found
        } else {
            return ResponseEntity.ok(tasks); // Returning the list of tasks
        }
    }

    /**
     * Get tasks by their due date.
     * @param dueDate The due date of tasks to filter by.
     * @return A list of tasks with the specified due date.
     */
    @GetMapping("/getByDueDate")
    @PreAuthorize("isAuthenticated()") // Ensures only authenticated users can access this
    public ResponseEntity<List<Task>> getTasksByDueDate(@RequestParam String dueDate) {

        List<Task> tasks = service.getTasksByDueDate(dueDate);
        if (tasks.isEmpty()) {
            return ResponseEntity.notFound().build(); // Returning 404 if no tasks are found
        } else {
            return ResponseEntity.ok(tasks); // Returning the list of tasks
        }
    }

    /**
     * Assign a task to a user.
     * @param taskId The ID of the task to assign.
     * @param assignedUser The user to assign the task to.
     * @return The updated task if successful, otherwise 404 Not Found.
     */
    @PutMapping("/assign/{taskId}")
    @PreAuthorize("isAuthenticated()") // Ensures only authenticated users can assign tasks
    public ResponseEntity<Task> assignTask(@PathVariable Long taskId, @RequestBody User assignedUser) {
        Task updatedTask = service.assignTaskToUser(taskId, assignedUser); // Calling service to assign task
        if (updatedTask != null) {
            return ResponseEntity.ok(updatedTask); // Returning the updated task
        } else {
            return ResponseEntity.notFound().build(); // Returning 404 if task not found
        }
    }

    /**
     * Update the status of a task.
     * @param taskId The ID of the task.
     * @param status The new status of the task.
     * @return The updated task if successful, otherwise 404 Not Found.
     */
    @PutMapping("/updateStatus/{taskId}")
    @PreAuthorize("isAuthenticated()") // Ensures only authenticated users can update task status
    public ResponseEntity<Task> updateTaskStatus(@PathVariable Long taskId, @RequestBody String status) {
        Task updatedTask = service.updateTaskStatus(taskId, status); // Calling service to update task status
        if (updatedTask != null) {
            return ResponseEntity.ok(updatedTask); // Returning the updated task
        } else {
            return ResponseEntity.notFound().build(); // Returning 404 if task not found
        }
    }

    /**
     * Get tasks assigned to a specific user.
     * @param userId The ID of the user to get tasks for.
     * @return A list of tasks assigned to the specified user.
     */
    @GetMapping("/getByUser/{userId}")
    @PreAuthorize("isAuthenticated()") // Ensures only authenticated users can access this
    public ResponseEntity<List<Task>> getTasksByUser(@PathVariable Long userId) {
        List<Task> tasks = service.getTasksByUser(userId); // Calling service to get tasks by user ID
        if (tasks.isEmpty()) {
            return ResponseEntity.notFound().build(); // Returning 404 if no tasks are found
        } else {
            return ResponseEntity.ok(tasks); // Returning the list of tasks
        }
    }

    /**
     * Get tasks within a specific date range.
     * @param startDate The start date of the range.
     * @param endDate The end date of the range.
     * @return A list of tasks within the date range.
     */
    @GetMapping("/getByDateRange")
    @PreAuthorize("isAuthenticated()") // Ensures only authenticated users can access this
    public ResponseEntity<List<Task>> getTasksByDateRange(@RequestParam String startDate, @RequestParam String endDate) {
        List<Task> tasks = service.getTasksByDateRange(startDate, endDate); // Calling service to get tasks by date range
        if (tasks.isEmpty()) {
            return ResponseEntity.notFound().build(); // Returning 404 if no tasks are found
        } else {
            return ResponseEntity.ok(tasks); // Returning the list of tasks
        }
    }

    /**
     * Mark a task as completed.
     * @param taskId The ID of the task to mark as completed.
     * @return The updated task if successful, otherwise 404 Not Found.
     */
    @PutMapping("/markAsCompleted/{taskId}")
    @PreAuthorize("isAuthenticated()") // Ensures only authenticated users can mark tasks as completed
    public ResponseEntity<Task> markTaskAsCompleted(@PathVariable Long taskId) {
        Task updatedTask = service.markTaskAsCompleted(taskId); // Calling service to mark the task as completed
        if (updatedTask != null) {
            return ResponseEntity.ok(updatedTask); // Returning the updated task
        } else {
            return ResponseEntity.notFound().build(); // Returning 404 if task not found
        }
    }

    /**
     * Get tasks with pagination and sorting.
     * @param page The page number.
     * @param size The number of tasks per page.
     * @param sortBy The sorting criteria (e.g., by due date).
     * @return A list of tasks according to the pagination and sorting.
     */
    @GetMapping("/getAllTaskPaged")
    @PreAuthorize("isAuthenticated()") // Ensures only authenticated users can access this
    public ResponseEntity<List<Task>> getAllTaskPaged(@RequestParam int page, @RequestParam int size, @RequestParam String sortBy) {
        List<Task> tasks = service.getAllTaskPaged(page, size, sortBy); // Calling service to get tasks with pagination and sorting
        if (tasks.isEmpty()) {
            return ResponseEntity.notFound().build(); // Returning 404 if no tasks are found
        } else {
            return ResponseEntity.ok(tasks); // Returning the list of tasks
        }
    }
}
