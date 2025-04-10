package com.Rahul.taskify.Service;

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

import java.time.LocalDateTime;
import java.util.List;

@Service
public class TaskService {

    @Autowired
    private TaskRepository repo;

    @Autowired
    private UserRepository userRepo;

    // Helper method: Checks whether the current user is an ADMIN.
    private boolean isAdmin(User user) {
        return user.getRoles().contains("ADMIN");
    }

    /**
     * Create a task for the current user.
     */
    public Task createTask(Task task) {
        User user = AuthUtil.getCurrentUser(userRepo);
        task.setCreatedBy(user);
        task.setAssignedTo(user); // Assign to self
        LocalDateTime now = LocalDateTime.now();
        task.setCreatedAt(now);
        task.setUpdatedAt(now);
        return repo.save(task);
    }

    /**
     * Overloaded method for creating a task for a target user.
     * Only admins can use this method.
     *
     * Note:
     * - createdBy remains the current (admin) user for audit/history.
     * - assignedTo is set to the target user.
     */
    public Task createTask(Task task, Long targetUserId) {
        User currentUser = AuthUtil.getCurrentUser(userRepo);
        task.setCreatedBy(currentUser);

        if (isAdmin(currentUser)) {
            if (targetUserId == null) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Target user ID is required when admin creates task for others");
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

    /**
     * Retrieve all tasks assigned to the current user.
     * Admins can use a different endpoint if needed.
     */
    public List<Task> getAllTask() {
        User user = AuthUtil.getCurrentUser(userRepo);

        if (isAdmin(user)) {
            return repo.findAll(); // Admin sees everything
        } else {
            return repo.findAllByAssignedTo(user); // Regular user sees only their assigned tasks
        }
    }


    /**
     * Get a specific task by ID.
     * - Admin: no filter.
     * - Regular user: must be assigned to the user.
     */
    public Task getTaskById(long id) {
        User user = AuthUtil.getCurrentUser(userRepo);
        return isAdmin(user)
                ? repo.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Task not found"))
                : repo.findByIdAndAssignedTo(id, user)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Task not found for this user"));
    }

    /**
     * Update a task.
     * - Admin: can update any task.
     * - Regular user: can only update tasks assigned to them.
     */
    public Task updateTask(long id, Task updatedTask) {
        User user = AuthUtil.getCurrentUser(userRepo);
        Task task = isAdmin(user)
                ? repo.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Task not found"))
                : repo.findByIdAndAssignedTo(id, user)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Task not found for this user"));

        task.setTitle(updatedTask.getTitle());
        task.setDescription(updatedTask.getDescription());
        task.setDueDate(updatedTask.getDueDate());
        task.setPriority(updatedTask.getPriority());
        task.setStatus(updatedTask.getStatus());
        task.setCompleted(updatedTask.isCompleted());
        task.setUpdatedAt(LocalDateTime.now());
        return repo.save(task);
    }

    /**
     * Delete a task.
     * - Admin: can delete any task.
     * - Regular user: can delete only tasks assigned to them.
     */
    public void deleteTask(long id) {
        User user = AuthUtil.getCurrentUser(userRepo);
        Task task = isAdmin(user)
                ? repo.findById(id).orElseThrow(() -> new EntityNotFoundException("Task not found with id: " + id))
                : repo.findByIdAndAssignedTo(id, user)
                .orElseThrow(() -> new EntityNotFoundException("Task not found with id: " + id));
        repo.delete(task);
    }

    /**
     * Update the status of a task.
     */
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

    /**
     * Get tasks by their status.
     */
    public List<Task> getTasksByStatus(String status) {
        User user = AuthUtil.getCurrentUser(userRepo);
        return isAdmin(user)
                ? repo.findByStatus(status)
                : repo.findByStatusAndAssignedTo(status, user);
    }

    /**
     * Get tasks by their priority.
     */
    public List<Task> getTasksByPriority(String priority) {
        User user = AuthUtil.getCurrentUser(userRepo);
        return isAdmin(user)
                ? repo.findByPriority(priority)
                : repo.findByPriorityAndAssignedTo(priority, user);
    }

    /**
     * Get tasks by their due date.
     */
    public List<Task> getTasksByDueDate(String dueDate) {
        User user = AuthUtil.getCurrentUser(userRepo);
        LocalDateTime due = LocalDateTime.parse(dueDate);
        return isAdmin(user)
                ? repo.findByDueDate(due)
                : repo.findByDueDateAndAssignedTo(due, user);
    }

    /**
     * Assign a task to a user.
     * Note: Only admin can assign a task to someone else.
     */
    public Task assignTaskToUser(long taskId, User targetUser) {
        User currentUser = AuthUtil.getCurrentUser(userRepo);
        Task task = isAdmin(currentUser)
                ? repo.findById(taskId).orElseThrow(() -> new EntityNotFoundException("Task not found"))
                : repo.findByIdAndAssignedTo(taskId, currentUser)
                .orElseThrow(() -> new EntityNotFoundException("Task not found"));
        task.setAssignedTo(targetUser);
        return repo.save(task);
    }

    /**
     * Get tasks assigned to a specific user.
     */
    public List<Task> getTasksByUser(long userId) {
        User user = userRepo.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));
        return repo.findAllByAssignedTo(user);
    }

    /**
     * Get tasks within a date range.
     * - Admin: date range across all tasks.
     * - Regular user: only tasks assigned to them.
     */
    public List<Task> getTasksByDateRange(String startDate, String endDate) {
        User user = AuthUtil.getCurrentUser(userRepo);
        LocalDateTime start = LocalDateTime.parse(startDate);
        LocalDateTime end = LocalDateTime.parse(endDate);
        return isAdmin(user)
                ? repo.findByDateRange(start, end)
                : repo.findByDateRangeAndAssignedTo(start, end, user);
    }

    /**
     * Mark a task as completed.
     */
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

    /**
     * Get tasks with pagination filtering by assignment.
     */
    public Page<Task> getAllTaskPaged(Pageable pageable) {
        User user = AuthUtil.getCurrentUser(userRepo);
        return isAdmin(user) ? repo.findAll(pageable) : repo.findAllByAssignedTo(user, pageable);
    }

    // The remaining helper methods (getPriorityValue, getStatusValue) are unchanged.
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
