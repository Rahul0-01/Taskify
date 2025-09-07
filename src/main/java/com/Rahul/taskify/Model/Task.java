package com.Rahul.taskify.Model;

import com.fasterxml.jackson.annotation.*;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.io.Serializable;
import java.time.LocalDateTime;

@Entity
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "createdTasks"})
@AllArgsConstructor
@NoArgsConstructor
@Data
@JsonIdentityInfo(
        generator = ObjectIdGenerators.PropertyGenerator.class,
        property = "id"
)
public class Task implements Serializable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Schema(accessMode = Schema.AccessMode.READ_ONLY)

    private Long id; // Unique ID for the task

    private String title; // The title of the task

    @Lob
    private String description;
    // Detailed description of the task
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss")
    @Schema(type = "string", example = "2025-09-28T08:35:16", format = "date-time")
    private LocalDateTime dueDate;


    @Schema(accessMode = Schema.AccessMode.READ_ONLY) // i hide this field from swagger ui as user dont know what are the options for him like MEDIUM OR medium or semi medium etc
    private String priority; // Priority (Low, Medium, High)
    @Schema(accessMode = Schema.AccessMode.READ_ONLY)
    private String status; // Status (Pending, In Progress, Completed)
    @Schema(accessMode = Schema.AccessMode.READ_ONLY)
    private boolean completed; // Track if the task is completed

    @ManyToOne
    @JoinColumn(name = "created_by")
    @Schema(accessMode = Schema.AccessMode.READ_ONLY)
    private User createdBy;

    @ManyToOne
    @JoinColumn(name = "assigned_to")
    @Schema(accessMode = Schema.AccessMode.READ_ONLY)
    private User assignedTo;
    @CreationTimestamp
    @Schema(accessMode = Schema.AccessMode.READ_ONLY)
    private LocalDateTime createdAt;  // Timestamp when the task was created

    @UpdateTimestamp
    @Schema(accessMode = Schema.AccessMode.READ_ONLY)
    private LocalDateTime updatedAt;  // Timestamp when the task was last updated

    @PrePersist
    public void prePersist() {
        if (this.createdAt == null) {
            this.createdAt = LocalDateTime.now();
        }
        if (this.updatedAt == null) {
            this.updatedAt = LocalDateTime.now();
        }
    }

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
