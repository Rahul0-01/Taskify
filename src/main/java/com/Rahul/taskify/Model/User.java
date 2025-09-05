package com.Rahul.taskify.Model;

import com.fasterxml.jackson.annotation.*;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;

@AllArgsConstructor
@NoArgsConstructor
@Data
@Entity
@Table(name = "users")
@JsonIdentityInfo(
        generator = ObjectIdGenerators.PropertyGenerator.class,
        property = "id"
)
public class User {

    //in this class u might see  @Schema(accessMode = Schema.AccessMode.READ_ONLY) this annotation . this
    // annotation is basically used for swagger ui . means if someone try to create/regiser user via swagger ui
    // then the fields which should be filled automatically like id,createdAt etc should not be visible to user thats why
    //we use this annotation .

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Schema(accessMode = Schema.AccessMode.READ_ONLY)
    private Long id;

    @Column(name = "user_name")
    private String userName;

    private String password;

    @Column(nullable = false, unique = true)
    private String email;




    @JsonProperty("roles")
    @JsonDeserialize(as = java.util.HashSet.class)
    @Schema(accessMode = Schema.AccessMode.READ_ONLY)
    private Set<String> roles;

    @CreationTimestamp
    @Schema(accessMode = Schema.AccessMode.READ_ONLY)
    private LocalDateTime createdAt;  // When the user was created

    @UpdateTimestamp
    @Schema(accessMode = Schema.AccessMode.READ_ONLY)
    private LocalDateTime updatedAt;  // When the user was last updated

    // One-to-many relationship with Task (tasks created by the user)
    @OneToMany(mappedBy = "createdBy")
    @JsonIgnore
    private List<Task> createdTasks;


    // One-to-many relationship with Task (tasks assigned to the user)
    @OneToMany(mappedBy = "assignedTo")
    @JsonIgnore
    private List<Task> assignedTasks;

    public void setUpdatedAtNow() {
        this.updatedAt = java.time.LocalDateTime.now();
    }

}
