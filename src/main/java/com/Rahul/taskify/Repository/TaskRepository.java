package com.Rahul.taskify.Repository;

import com.Rahul.taskify.Model.Task;
import com.Rahul.taskify.Model.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface TaskRepository extends JpaRepository<Task, Long> {

    // Used for general display of user tasks
    List<Task> findAllByAssignedTo(User user);
    Page<Task> findAllByAssignedTo(User user, Pageable pageable);

    // Used for secure fetches by ID
    Optional<Task> findByIdAndAssignedTo(Long id, User user);

    // Used for task filtering for assigned users
    List<Task> findByStatusAndAssignedTo(String status, User user);
    List<Task> findByPriorityAndAssignedTo(String priority, User user);
    List<Task> findByDueDateAndAssignedTo(LocalDateTime dueDate, User user);

    // Used when admins want to fetch *all tasks* by these filters
    List<Task> findByStatus(String status);
    List<Task> findByPriority(String priority);
    List<Task> findByDueDate(LocalDateTime dueDate);
    Page<Task> findAll(Pageable pageable); // Admin: get all tasks paginated

    // Date range filtering for assigned users
    @Query("SELECT t FROM Task t WHERE t.assignedTo = :user AND t.dueDate BETWEEN :start AND :end")
    List<Task> findByDateRangeAndAssignedTo(LocalDateTime start, LocalDateTime end, User user);

    // Date range filtering for admins
    @Query("SELECT t FROM Task t WHERE t.dueDate BETWEEN :start AND :end")
    List<Task> findByDateRange(LocalDateTime start, LocalDateTime end);

    // Optional: if you still want to see who created what (for admin/audit views)
    List<Task> findAllByCreatedBy(User user);
}
