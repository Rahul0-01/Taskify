package com.Rahul.taskify.Controller;

import com.Rahul.taskify.Model.Task;
import com.Rahul.taskify.Service.TaskService;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/task")
public class TaskController {

    @Autowired
    TaskService service;

    @PostMapping("/create")
    public ResponseEntity<String> createTask(@RequestBody Task task){
          service.createTask(task);
          return ResponseEntity.ok("Successfully created");
    }

    @GetMapping("/getAllTask")
    public List<Task> getAllTask(){
        return service.getAllTask();
    }

    @GetMapping("/getTask/{id}")
    public ResponseEntity<Task> getTaskById(@PathVariable long id){
         Task task = service.getTaskById(id);
         if(task != null){
             return ResponseEntity.ok(task);
         }
         else{
             return  ResponseEntity.notFound().build();
         }
    }

    @PutMapping("/update/{id}")
    public ResponseEntity<Task> updateTask(@PathVariable long id , @RequestBody Task updatedTask ){
      Task task = service.updateTask(id,updatedTask);
    if(task != null){
        return ResponseEntity.ok(task);
    }
    else{
        return ResponseEntity.notFound().build();
    }
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<String> deleteTask(@PathVariable long id){
            try{
                service.deleteTask(id);
                return ResponseEntity.ok("Task Deleted Successfully");
            }
            catch(EntityNotFoundException e){
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Task Not found");
            } catch (Exception e) {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("An error occurred while deleting the task");

            }
    }



// below is used because when when 404 not foung error was coming then with it .... i am getting a long error message , so to remove this and to get only
    // user friendly error message i am using this .
    @ExceptionHandler(ResponseStatusException.class)
    public ResponseEntity<String> handleNotFound(ResponseStatusException ex) {
        return ResponseEntity.status(ex.getStatusCode()).body(ex.getReason());
        // Returns only "Task not found" instead of a long error message
    }

}
