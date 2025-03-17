package com.Rahul.taskify.Service;

import com.Rahul.taskify.Model.User;
import com.Rahul.taskify.Repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class CustomUserDetailService implements UserDetailsService {
    @Autowired
    private UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        User user = userRepository.findByUserName(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + username));

        System.out.println("User found: " + user.getUserName() + " with roles: " + user.getRoles());  // Debugging line

        List<GrantedAuthority> authorities = user.getRoles().stream()
                .map(role -> {
                    String cleanedRole = role.replace("[", "").replace("]", ""); // Remove any stray brackets
                    System.out.println("DEBUG: Assigning role -> " + cleanedRole);
                    return new SimpleGrantedAuthority("ROLE_" + cleanedRole); // Add "ROLE_" prefix
                })
                .collect(Collectors.toList());

        return new org.springframework.security.core.userdetails.User(
                user.getUserName(),
                user.getPassword(),
                authorities
        );
    }


}
