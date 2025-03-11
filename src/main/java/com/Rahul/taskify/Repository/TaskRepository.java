package com.Rahul.taskify.Repository;

import com.Rahul.taskify.Model.Task;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TaskRepository extends JpaRepository<Task,Long> {


}
