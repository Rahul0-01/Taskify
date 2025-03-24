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

import java.util.List;

@Service
public class TaskService {

    @Autowired
    private TaskRepository repo;

    @Autowired
    private UserRepository userRepo;

    public Task createTask(Task task) {
        User user = AuthUtil.getCurrentUser(userRepo);
        task.setUser(user);
       return repo.save(task);
    }

    public List<Task> getAllTask() {
        User user = AuthUtil.getCurrentUser(userRepo);
        return repo.findAllByUser(user);
    }

    public Task getTaskById(long id) {
        User user = AuthUtil.getCurrentUser(userRepo);
        return repo.findByIdAndUser(id, user)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Task not found for this user"));
    }

    public Task updateTask(long id, Task updatedTask) {
        User user = AuthUtil.getCurrentUser(userRepo);
        return repo.findByIdAndUser(id, user)
                .map(task -> {
                    task.setTitle(updatedTask.getTitle());
                    task.setDescription(updatedTask.getDescription());
                    task.setCompleted(updatedTask.isCompleted());
                    return repo.save(task);
                }).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Task not found for this user"));
    }

    public void deleteTask(long id) {
        User user = AuthUtil.getCurrentUser(userRepo);
        Task task = repo.findByIdAndUser(id, user)
                .orElseThrow(() -> new EntityNotFoundException("Task not found with id: " + id));
        repo.delete(task);
    }
}
