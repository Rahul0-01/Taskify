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

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

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

 // this is the method to register user
 public ResponseEntity<?> registerUser(User user) {
     if (repo.findByUserName(user.getUserName()).isPresent()) {
         return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Username already exists");
     }

     // Hash password before saving
     user.setPassword(passwordEncoder.encode(user.getPassword()));

     if (user.getRoles() == null || user.getRoles().isEmpty()) {
         return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Role must be provided");
     }


     // Save user
     repo.save(user);



     return ResponseEntity.ok("User registered successfully");
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
            System.out.println("Roles assigned to user: " + user.getRoles());
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

}
