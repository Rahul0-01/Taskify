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
import com.Rahul.taskify.JwUtil;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/users")
public class UserController {

    @Autowired
    private UserService userService;

    @Autowired
    private JwUtil JwUtil;

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

    @PostMapping("/refresh")
    public ResponseEntity<?> refreshToken(@RequestBody Map<String, String> request) {
        String refreshToken = request.get("refreshToken");

        if (refreshToken == null || refreshToken.isEmpty()) {
            return ResponseEntity.badRequest().body("Refresh token is required");
        }

        try {
            // Extract username from refresh token
            String username = JwUtil.extractUsername(refreshToken);

            // Validate refresh token
            User user = userService.getUserEntityByUsername(username);
            if (!JwUtil.validateToken(refreshToken, user.getUserName())) {
                return ResponseEntity.status(401).body("Invalid or expired refresh token");
            }


            // Generate new access token
            String newAccessToken = JwUtil.generateAccessToken(username);

            Map<String, Object> response = new HashMap<>();
            response.put("accessToken", newAccessToken);
            response.put("refreshToken", refreshToken); // send back same refresh token
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            return ResponseEntity.status(401).body("Invalid refresh token");
        }
    }



}
