package com.Rahul.taskify.Controller;

import com.Rahul.taskify.Model.LoginRequest;
import com.Rahul.taskify.Model.User;
import com.Rahul.taskify.Repository.UserRepository;
import com.Rahul.taskify.Service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/users")
public class UserController {

    @Autowired
    private UserService userService;

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@RequestBody User user){

        return userService.registerUser(user);
    }

    @GetMapping("/{username}")
    public ResponseEntity<?> getUserByUserName(@PathVariable String username) {
        return ResponseEntity.ok().body(userService.getUserByUserName(username));
    }

   @PostMapping("/login")
    public ResponseEntity<?> loginUser(@RequestBody LoginRequest loginRequest){
     return userService.loginUser(loginRequest);
  }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/admin")
    public ResponseEntity<?> adminPage() {
        return ResponseEntity.ok("Welcome Admin! You have access.");
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/allUsers")
    public ResponseEntity<?> getAllUsers(){
        return ResponseEntity.ok(userService.getAllUsers());
    }

    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/DeleteUser/{userId}")
    public ResponseEntity<?> deleteUser(@PathVariable long userId){
        System.out.println("Hi delete method of controleler is being calleing");
        return ResponseEntity.ok(userService.deleteUser(userId));
    }


}
