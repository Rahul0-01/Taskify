package com.Rahul.taskify.Repository;

import com.Rahul.taskify.Model.Task;
import com.Rahul.taskify.Model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface TaskRepository extends JpaRepository<Task,Long> {

    // ✅ Fetch all tasks that belong to a specific user
    List<Task> findAllByUser(User user);

    // ✅ Fetch a task by its ID that belongs to a specific user
    Optional<Task> findByIdAndUser(Long id, User user);
}
