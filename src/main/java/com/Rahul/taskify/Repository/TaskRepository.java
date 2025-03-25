package com.Rahul.taskify.Repository;

import com.Rahul.taskify.Model.Task;
import com.Rahul.taskify.Model.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface TaskRepository extends JpaRepository<Task, Long> {

    /**
     * Fetch all tasks created by a specific user.
     * @param createdBy The user who created the tasks.
     * @return A list of tasks.
     */
    List<Task> findAllByCreatedBy(User createdBy);

    /**
     * Fetch a task by its ID for a specific creator.
     * @param id The task ID.
     * @param createdBy The user who created the task.
     * @return An Optional containing the task if found.
     */
    Optional<Task> findByIdAndCreatedBy(Long id, User createdBy);

    /**
     * Fetch tasks by status and the user who created them.
     * @param status The task status (e.g., Pending, Completed).
     * @param createdBy The user who created the tasks.
     * @return A list of tasks.
     */
    List<Task> findByStatusAndCreatedBy(String status, User createdBy);

    /**
     * Fetch tasks by priority and the user who created them.
     * @param priority The task priority (e.g., Low, Medium, High).
     * @param createdBy The user who created the tasks.
     * @return A list of tasks.
     */
    List<Task> findByPriorityAndCreatedBy(String priority, User createdBy);

    /**
     * Fetch tasks by due date and the user who created them.
     * Note: The Task entity defines dueDate as LocalDateTime.
     * @param dueDate The due date to filter by.
     * @param createdBy The user who created the tasks.
     * @return A list of tasks.
     */
    List<Task> findByDueDateAndCreatedBy(LocalDateTime dueDate, User createdBy);

    /**
     * Fetch all tasks assigned to a specific user.
     * @param assignedTo The user to whom tasks are assigned.
     * @return A list of tasks.
     */
    List<Task> findAllByAssignedTo(User assignedTo);

    /**
     * Fetch tasks created by a specific user within a date range.
     * This query uses the createdAt timestamp of the task.
     * @param startDate The start of the date range.
     * @param endDate The end of the date range.
     * @param createdBy The user who created the tasks.
     * @return A list of tasks.
     */
    @Query("SELECT t FROM Task t WHERE t.createdBy = :user AND t.createdAt BETWEEN :startDate AND :endDate")
    List<Task> findByDateRangeAndCreatedBy(@Param("startDate") LocalDateTime startDate,
                                           @Param("endDate") LocalDateTime endDate,
                                           @Param("user") User createdBy);

    /**
     * Fetch tasks created by a specific user using pagination and sorting.
     * @param createdBy The user who created the tasks.
     * @param pageable Pageable object containing page number, size, and sorting details.
     * @return A page of tasks.
     */
    Page<Task> findAllByCreatedBy(User createdBy, Pageable pageable);

    /**
     * Custom default method to support pagination and sorting as used in TaskService.
     * @param page The page number.
     * @param size The number of tasks per page.
     * @param sortBy The field to sort by.
     * @param createdBy The user who created the tasks.
     * @return A list of tasks from the requested page.
     */
    default List<Task> findAllPagedAndSortedByCreatedBy(int page, int size, String sortBy, User createdBy) {
        Pageable pageable = org.springframework.data.domain.PageRequest.of(page, size,
                org.springframework.data.domain.Sort.by(sortBy));
        return findAllByCreatedBy(createdBy, pageable).getContent();
    }
}
