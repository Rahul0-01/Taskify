package com.Rahul.taskify.Model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
@AllArgsConstructor
@NoArgsConstructor
@Data
public class Task {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;
    private String description;
    private LocalDateTime dueDate;  // Task's due date
    private String priority; // Task's priority (Low, Medium, High)
    private String status; // Task's current status (Pending, In Progress, Completed)

    @ManyToOne
    @JoinColumn(name = "created_by")
    private User createdBy;  // User who created the task (Many tasks created by one user)

    @ManyToOne
    @JoinColumn(name = "assigned_to")
    private User assignedTo;  // User who is assigned the task (Many tasks assigned to one user)

    private LocalDateTime createdAt;  // When the task was created
    private LocalDateTime updatedAt;  // When the task was last updated


    // Getters and Setters for all fields
}
