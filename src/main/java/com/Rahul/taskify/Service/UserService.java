// this layer will do the registration of new users by encrypting password and also retrival of existing user after authentication.

package com.Rahul.taskify.Service;

import com.Rahul.taskify.Model.User;
import com.Rahul.taskify.Repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class UserService {

    @Autowired
   private UserRepository repo;      // this is the object of repository class which will help us to do databse related function

    @Autowired
    private BCryptPasswordEncoder passwordEncoder;      // this is used to encrypt password before adding the user password to the database for security

 // this is the method to register user
    public ResponseEntity<User> registerUser(User user){

        user.setPassword(passwordEncoder.encode(user.getPassword()));

        return ResponseEntity.ok().body(repo.save(user));

    }

    public ResponseEntity<?> getUserByUserName(String userName) {
        Optional<User> user = repo.findByUserName(userName);

        if (user.isPresent()) {
            return ResponseEntity.ok(user.get()); // 200 OK with user data
        } else {
            return ResponseEntity.status(404).body("User not found!"); // 404 Not Found
        }
    }

}
