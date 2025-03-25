package com.Rahul.taskify.Service;

import com.Rahul.taskify.Model.Task;
import com.Rahul.taskify.Model.User;
import com.Rahul.taskify.Repository.TaskRepository;
import com.Rahul.taskify.Repository.UserRepository;
import com.Rahul.taskify.Util.AuthUtil;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class TaskService {

    @Autowired
    private TaskRepository repo;

    @Autowired
    private UserRepository userRepo;

    public Task createTask(Task task) {
        // Get the currently authenticated user
        User user = AuthUtil.getCurrentUser(userRepo);

        // Associate the task with the user who created it
        task.setCreatedBy(user);

        // Optionally assign the task to the creator (or another user)
        task.setAssignedTo(user);

        // Set createdAt and updatedAt timestamps
        task.setCreatedAt(LocalDateTime.now());
        task.setUpdatedAt(LocalDateTime.now());

        // Save and return the task
        return repo.save(task);
    }


    public List<Task> getAllTask() {
        User user = AuthUtil.getCurrentUser(userRepo);
        return repo.findAllByCreatedBy(user); // Retrieve all tasks for the user (created by the user)
    }

    public Task getTaskById(long id) {
        User user = AuthUtil.getCurrentUser(userRepo);
        return repo.findByIdAndCreatedBy(id, user) // Use 'createdBy' for filtering tasks for the current user
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Task not found for this user"));
    }

    public Task updateTask(long id, Task updatedTask) {
        User user = AuthUtil.getCurrentUser(userRepo);
        Task currenttask = getTaskById(id);
        currenttask.setUpdatedAt(LocalDateTime.now());

        return repo.findByIdAndCreatedBy(id, user)
                .map(task -> {
                    task.setTitle(updatedTask.getTitle());
                    task.setDescription(updatedTask.getDescription());
                    task.setDueDate(updatedTask.getDueDate());       // Update dueDate
                    task.setPriority(updatedTask.getPriority());     // Update priority
                    task.setStatus(updatedTask.getStatus());         // Update status
                    task.setCompleted(updatedTask.isCompleted());    // Update completed flag
                    task.setUpdatedAt(LocalDateTime.now());          // Update timestamp
                    return repo.save(task);
                }).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Task not found for this user"));
    }

    public void deleteTask(long id) {
        User user = AuthUtil.getCurrentUser(userRepo);
        Task task = repo.findByIdAndCreatedBy(id, user)
                .orElseThrow(() -> new EntityNotFoundException("Task not found with id: " + id));
        repo.delete(task);
    }

    public Task updateTaskStatus(Long taskId, String status) {
        // Check if task exists
        Task task = repo.findById(taskId).orElse(null);

        if (task != null) {
            // Update the status of the task
            task.setStatus(status);
            // Save the updated task in the database
            return repo.save(task);
        }
        return null; // Return null if task is not found
    }

    public List<Task> getTasksByStatus(String status) {
        User user = AuthUtil.getCurrentUser(userRepo);
        return repo.findByStatusAndCreatedBy(status, user); // Filter tasks by status and user
    }

    public List<Task> getTasksByPriority(String priority) {
        User user = AuthUtil.getCurrentUser(userRepo);
        return repo.findByPriorityAndCreatedBy(priority, user); // Filter tasks by priority and user
    }

    public List<Task> getTasksByDueDate(String dueDate) {
        User user = AuthUtil.getCurrentUser(userRepo);
        LocalDateTime due = LocalDateTime.parse(dueDate);
        return repo.findByDueDateAndCreatedBy(due, user); // Filter tasks by due date and user
    }

    public Task assignTaskToUser(long taskId, User user) {
        User currentUser = AuthUtil.getCurrentUser(userRepo);
        Task task = repo.findByIdAndCreatedBy(taskId, currentUser)
                .orElseThrow(() -> new EntityNotFoundException("Task not found"));
        task.setAssignedTo(user); // Assign the task to another user
        return repo.save(task);
    }

    public List<Task> getTasksByUser(long userId) {
        User user = userRepo.findById(userId).orElseThrow(() -> new EntityNotFoundException("User not found"));
        return repo.findAllByAssignedTo(user); // Get tasks assigned to the given user
    }

    public List<Task> getTasksByDateRange(String startDate, String endDate) {
        User user = AuthUtil.getCurrentUser(userRepo);
        LocalDateTime start = LocalDateTime.parse(startDate);
        LocalDateTime end = LocalDateTime.parse(endDate);
        return repo.findByDateRangeAndCreatedBy(start, end, user); // Find tasks by date range and user
    }

    public Task markTaskAsCompleted(long taskId) {
        User user = AuthUtil.getCurrentUser(userRepo);
        return repo.findByIdAndCreatedBy(taskId, user)
                .map(task -> {
                    task.setCompleted(true);
                    task.setStatus("Completed");
                    task.setUpdatedAt(LocalDateTime.now());
                    return repo.save(task);
                }).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Task not found for this user"));
    }


    public List<Task> getAllTaskPaged(int page, int size, String sortBy) {
        User user = AuthUtil.getCurrentUser(userRepo);
        List<Task> tasks = repo.findAllByCreatedBy(user);

        // Apply sorting
        switch (sortBy.toLowerCase()) {
            case "priority" -> tasks.sort((a, b) -> Integer.compare(getPriorityValue(a.getPriority()), getPriorityValue(b.getPriority())));
            case "duedate" -> tasks.sort((a, b) -> a.getDueDate().compareTo(b.getDueDate()));
            case "createdat" -> tasks.sort((a, b) -> a.getCreatedAt().compareTo(b.getCreatedAt()));
            case "status" -> tasks.sort((a, b) -> Integer.compare(getStatusValue(a.getStatus()), getStatusValue(b.getStatus())));
        }

        // Pagination logic
        int fromIndex = page * size;
        int toIndex = Math.min(fromIndex + size, tasks.size());
        if (fromIndex > toIndex) {
            return List.of(); // return empty list if page out of range
        }

        return tasks.subList(fromIndex, toIndex);
    }

    private int getPriorityValue(String priority) {
        return switch (priority) {
            case "High" -> 1;
            case "Medium" -> 2;
            case "Low" -> 3;
            default -> 4;
        };
    }

    private int getStatusValue(String status) {
        return switch (status.toLowerCase()) {
            case "completed" -> 1;
            case "in progress" -> 2;
            case "pending" -> 3;
            default -> 4;
        };
    }



}
