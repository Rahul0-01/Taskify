package com.Rahul.taskify.Service;

import com.Rahul.taskify.Model.Task;
import com.Rahul.taskify.Repository.TaskRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class TaskService {

    @Autowired
    TaskRepository repo;


    public void createTask(Task task){
        repo.save(task);
    }

    public List<Task> getAllTask() {
        return repo.findAll();
    }

    public Task getTaskById(long id) {
        // below i am using else throw because it was showing 505 internal server error when i am using wrong id....so this is used for showing 404 error
        return repo.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Task not found"));

    }

    public Task updateTask(long id, Task updatedTask) {
        return repo.findById(id)
                .map(task -> {
                    task.setTitle(updatedTask.getTitle());
                    task.setDescription(updatedTask.getDescription());
                    task.setCompleted(updatedTask.isCompleted());
                    return repo.save(task);

                }).orElse(null);
    }

    public void deleteTask(long id) {
        Task task = repo.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Task not found with id: " + id));
        repo.delete(task);
    }
}
