// this layer will do the registration of new users by encrypting password and also retrival of existing user after authentication.

package com.Rahul.taskify.Service;

import com.Rahul.taskify.JwUtil;
import com.Rahul.taskify.Model.LoginRequest;
import com.Rahul.taskify.Model.User;
import com.Rahul.taskify.Repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class UserService {

    @Autowired
    private AuthenticationManager authenticationManager;
    @Autowired
   private UserRepository repo;// this is the object of repository class which will help us to do databse related function


    @Autowired
    private  JwUtil jwUtil;
    @Autowired
    private BCryptPasswordEncoder passwordEncoder;      // this is used to encrypt password before adding the user password to the database for security

    @Autowired
    private EmailService emailService;

    public ResponseEntity<?> registerUser(User user) {
        if (repo.findByUserName(user.getUserName()).isPresent()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Username already exists");
        }

        if (user.getPassword().length() < 5) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Password must be at least 5 characters long");
        }

        if (user.getEmail() == null || user.getEmail().isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Email is required");
        }

        // Encrypt password and assign role
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        user.setRoles(Set.of("USER"));

        // Save user to DB
        repo.save(user);

        // ✅ HTML styled welcome email body
        String subject = "🎉 Welcome to Taskify!";
        String body = "<h2>Hi " + user.getUserName() + ",</h2>" +
                "<p>Thank you for registering on <strong>Taskify</strong>!</p>" +
                "<p>We're excited to have you on board.</p>" +
                "<br/><p>🚀 Start managing your tasks like a pro!</p>" +
                "<br/><p style='color:gray;'>– The Taskify Team</p>";

        try {
            emailService.sendEmail(user.getEmail(), subject, body);
        } catch (Exception e) {
            System.err.println("Email sending failed: " + e.getMessage());
            // Optional: Log this error
        }

        return ResponseEntity.ok("User registered successfully ");
    }


    public ResponseEntity<?> getUserByUserName(String userName) {
        Optional<User> user = repo.findByUserName(userName);

        if (user.isPresent()) {
            return ResponseEntity.ok(user.get()); // 200 OK with user data
        } else {
            return ResponseEntity.status(404).body("User not found!"); // 404 Not Found
        }
    }

    public ResponseEntity<?> loginUser(LoginRequest loginRequest) {
        try {
            System.out.println("DEBUG: Login request received for user -> " + loginRequest.getUserName());

            // Fetch user from DB
            User user = repo.findByUserName(loginRequest.getUserName())
                    .orElseThrow(() -> new UsernameNotFoundException("User not found"));

            System.out.println("DEBUG: User found in DB -> " + user.getUserName());
            System.out.println("DEBUG: Encrypted Password from DB -> " + user.getPassword());
            System.out.println("DEBUG: Password entered by user -> " + loginRequest.getUserPassword());

            // Check if passwords match
            if (!passwordEncoder.matches(loginRequest.getUserPassword(), user.getPassword())) {
                System.out.println("DEBUG: Password mismatch for user -> " + loginRequest.getUserName());
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid password");
            }

            // Authenticate user
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(loginRequest.getUserName(), loginRequest.getUserPassword())
            );

            System.out.println("DEBUG: User authenticated successfully -> " + loginRequest.getUserName());

            // Generate token
            String token = jwUtil.generateToken(user.getUserName());

            // Prepare JSON response
            Map<String, Object> responseMap = new HashMap<>();
            responseMap.put("token", token);
            responseMap.put("roles", user.getRoles());

            return ResponseEntity.ok(responseMap);
        } catch (Exception e) {
            System.out.println("DEBUG: Login failed for user -> " + loginRequest.getUserName() + " | Error: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid username or password");
        }
    }

    public ResponseEntity<?> getAllUsers() {
        return ResponseEntity.ok(repo.findAll());
    }

    public ResponseEntity<?> deleteUser(long userId) {
        System.out.println("Hii till here is okay means delete method is being called properly ");
        Optional<User> userOptional = repo.findById(userId);
        System.out.println("still working wow");

        if (userOptional.isPresent()) {

            repo.deleteById(userId);
            return ResponseEntity.ok("User deleted successfully");
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found with ID: " + userId);
        }
    }

}
