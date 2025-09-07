package com.Rahul.taskify.Service;

import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.CachePut;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import com.Rahul.taskify.Model.Task;
import com.Rahul.taskify.Model.User;
import com.Rahul.taskify.Repository.TaskRepository;
import com.Rahul.taskify.Repository.UserRepository;
import com.Rahul.taskify.Util.AuthUtil;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeParseException;
import java.util.Collections;
import java.util.List;

@Service
public class TaskService {

    @Autowired
    private TaskRepository repo;

    @Autowired
    private UserRepository userRepo;

    // ----------------- Helper methods -----------------

    private boolean isAdmin(User user) {
        return user.getRoles().contains("ADMIN");
    }

    // This method has been changed to public to be accessible by the caching proxy
    public Long getCurrentUserId() {
        return AuthUtil.getCurrentUser(userRepo).getId();
    }

    // ----------------- CRUD methods -----------------

    @CachePut(value = "tasks", key = "#result.createdBy.id")
    public Task createTask(Task task) {
        User user = AuthUtil.getCurrentUser(userRepo);
        task.setCreatedBy(user);
        task.setAssignedTo(user);
        LocalDateTime now = LocalDateTime.now();
        task.setCreatedAt(now);
        task.setUpdatedAt(now);
        return repo.save(task);
    }

    @CachePut(value = "tasks", key = "#result.assignedTo.id")
    public Task createTask(Task task, Long targetUserId) {
        User currentUser = AuthUtil.getCurrentUser(userRepo);
        task.setCreatedBy(currentUser);

        if (isAdmin(currentUser)) {
            if (targetUserId == null) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                        "Target user ID is required when admin creates task for others");
            }
            User targetUser = userRepo.findById(targetUserId)
                    .orElseThrow(() -> new EntityNotFoundException("Assigned user not found with id: " + targetUserId));
            task.setAssignedTo(targetUser);
        } else {
            task.setAssignedTo(currentUser);
        }

        task.setCreatedAt(LocalDateTime.now());
        task.setUpdatedAt(LocalDateTime.now());
        return repo.save(task);
    }

    @Cacheable(value = "tasks", key = "#root.target.getCurrentUserId()")
    public List<Task> getAllTask() {
        User user = AuthUtil.getCurrentUser(userRepo);
        return isAdmin(user) ? repo.findAll() : repo.findAllByAssignedTo(user);
    }

    @Cacheable(value = "task", key = "#id")
    public Task getTaskById(long id) {
        User user = AuthUtil.getCurrentUser(userRepo);
        return isAdmin(user)
                ? repo.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Task not found"))
                : repo.findByIdAndAssignedTo(id, user)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Task not found for this user"));
    }

    @CachePut(value = "task", key = "#id")
    @CacheEvict(value = "tasks", key = "#result.assignedTo.id", beforeInvocation = false)
    public Task updateTask(long id, Task updatedTask) {
        User user = AuthUtil.getCurrentUser(userRepo);
        Task task = isAdmin(user)
                ? repo.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Task not found"))
                : repo.findByIdAndAssignedTo(id, user)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Task not found for this user"));

        if (updatedTask.getTitle() != null) task.setTitle(updatedTask.getTitle());
        if (updatedTask.getDescription() != null) task.setDescription(updatedTask.getDescription());
        if (updatedTask.getDueDate() != null) task.setDueDate(updatedTask.getDueDate());
        if (updatedTask.getPriority() != null) task.setPriority(updatedTask.getPriority());
        if (updatedTask.getStatus() != null) task.setStatus(updatedTask.getStatus());
        task.setCompleted(updatedTask.isCompleted());
        task.setUpdatedAt(LocalDateTime.now());
        return repo.save(task);
    }

    @CacheEvict(value = "task", key = "#id")
    public void deleteTask(long id) {
        User user = AuthUtil.getCurrentUser(userRepo);
        Task task = isAdmin(user)
                ? repo.findById(id).orElseThrow(() -> new EntityNotFoundException("Task not found with id: " + id))
                : repo.findByIdAndAssignedTo(id, user)
                .orElseThrow(() -> new EntityNotFoundException("Task not found with id: " + id));
        repo.delete(task);
    }

    @CachePut(value = "task", key = "#taskId")
    @CacheEvict(value = "tasks", key = "#result.assignedTo.id", beforeInvocation = false)
    public Task updateTaskStatus(Long taskId, String status) {
        User user = AuthUtil.getCurrentUser(userRepo);
        Task task = isAdmin(user)
                ? repo.findById(taskId).orElse(null)
                : repo.findByIdAndAssignedTo(taskId, user).orElse(null);
        if (task != null) {
            task.setStatus(status);
            task.setUpdatedAt(LocalDateTime.now());
            return repo.save(task);
        }
        return null;
    }

    @Cacheable(value = "tasks", key = "#status + '-' + #root.target.getCurrentUserId()")
    public List<Task> getTasksByStatus(String status) {
        User user = AuthUtil.getCurrentUser(userRepo);
        return isAdmin(user)
                ? repo.findByStatus(status)
                : repo.findByStatusAndAssignedTo(status, user);
    }

    @Cacheable(value = "tasks", key = "#priority + '-' + #root.target.getCurrentUserId()")
    public List<Task> getTasksByPriority(String priority) {
        User user = AuthUtil.getCurrentUser(userRepo);
        return isAdmin(user)
                ? repo.findByPriority(priority)
                : repo.findByPriorityAndAssignedTo(priority, user);
    }

    @Cacheable(value = "tasks", key = "#dueDateString + '-' + #root.target.getCurrentUserId()")
    public List<Task> getTasksByDueDate(String dueDateString) {
        User user = AuthUtil.getCurrentUser(userRepo);
        try {
            LocalDate parsedDate = LocalDate.parse(dueDateString);
            LocalDateTime startOfDay = parsedDate.atStartOfDay();
            LocalDateTime startOfNextDay = parsedDate.plusDays(1).atStartOfDay();

            return isAdmin(user)
                    ? repo.findByDueDateBetween(startOfDay, startOfNextDay)
                    : repo.findByDueDateBetweenAndAssignedTo(startOfDay, startOfNextDay, user);

        } catch (DateTimeParseException e) {
            System.err.println("Error parsing due date: " + e.getMessage());
            return Collections.emptyList();
        }
    }

    @CachePut(value = "task", key = "#taskId")
    @CacheEvict(value = "tasks", allEntries = true)
    public Task assignTaskToUser(long taskId, User targetUser) {
        User currentUser = AuthUtil.getCurrentUser(userRepo);
        Task task = isAdmin(currentUser)
                ? repo.findById(taskId).orElseThrow(() -> new EntityNotFoundException("Task not found"))
                : repo.findByIdAndAssignedTo(taskId, currentUser)
                .orElseThrow(() -> new EntityNotFoundException("Task not found"));
        task.setAssignedTo(targetUser);
        return repo.save(task);
    }

    @Cacheable(value = "tasks", key = "#userId")
    public List<Task> getTasksByUser(long userId) {
        User user = userRepo.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));
        return repo.findAllByAssignedTo(user);
    }

    @Cacheable(value = "tasks", key = "#startDate + '-' + #endDate + '-' + #root.target.getCurrentUserId()")
    public List<Task> getTasksByDateRange(String startDate, String endDate) {
        User user = AuthUtil.getCurrentUser(userRepo);
        LocalDateTime start = LocalDateTime.parse(startDate);
        LocalDateTime end = LocalDateTime.parse(endDate);
        return isAdmin(user)
                ? repo.findByDateRange(start, end)
                : repo.findByDateRangeAndAssignedTo(start, end, user);
    }

    @CachePut(value = "task", key = "#taskId")
    @CacheEvict(value = "tasks", key = "#result.assignedTo.id", beforeInvocation = false)
    public Task markTaskAsCompleted(long taskId) {
        User user = AuthUtil.getCurrentUser(userRepo);
        Task task = isAdmin(user)
                ? repo.findById(taskId).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Task not found"))
                : repo.findByIdAndAssignedTo(taskId, user)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Task not found for this user"));
        task.setCompleted(true);
        task.setStatus("Completed");
        task.setUpdatedAt(LocalDateTime.now());
        return repo.save(task);
    }

    @Cacheable(value = "tasksPaged", key = "#pageable.pageNumber + '-' + #pageable.pageSize + '-' + #root.target.getCurrentUserId()")
    public Page<Task> getAllTaskPaged(Pageable pageable) {
        User user = AuthUtil.getCurrentUser(userRepo);
        return isAdmin(user) ? repo.findAll(pageable) : repo.findAllByAssignedTo(user, pageable);
    }

    // ----------------- Priority/Status helpers -----------------

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