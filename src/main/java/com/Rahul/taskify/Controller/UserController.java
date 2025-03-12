package com.Rahul.taskify.Controller;

import com.Rahul.taskify.Model.User;
import com.Rahul.taskify.Repository.UserRepository;
import com.Rahul.taskify.Service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/users")
public class UserController {

    @Autowired
    private UserService userService;

    @PostMapping("/register")
    public ResponseEntity<User> registerUser(@RequestBody User user){
        return userService.registerUser(user);
    }

    @GetMapping("/{username}")
    public ResponseEntity<?> getUserByUserName(@PathVariable String username) {
        return userService.getUserByUserName(username);
    }

}
