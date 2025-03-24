package com.Rahul.taskify.Util;

import com.Rahul.taskify.Model.User;
import com.Rahul.taskify.Repository.UserRepository;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;

public class AuthUtil {

    public static User getCurrentUser(UserRepository userRepo) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepo.findByUserName(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + username));
    }
}
