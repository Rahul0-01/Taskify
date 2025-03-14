package com.Rahul.taskify.Configuration;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

import static org.springframework.security.config.Customizer.withDefaults;


// this is used to encrypt our password
@Configuration
@EnableWebSecurity
public class UserConfiguration {

    private static final Logger logger = LoggerFactory.getLogger(UserConfiguration.class);

    /*  This class provides a password encoder bean, which is needed for encrypting and comparing passwords.

Explanation of Code:
@Configuration → Marks this as a configuration class.
@Bean → Defines a bean that will be used throughout the application.
public BCryptPasswordEncoder passwordEncoder() { return new BCryptPasswordEncoder(); }
Creates and returns a BCryptPasswordEncoder object that will be used in UserService.
Key Functionality:
Provides a secure way to hash passwords.
Allows password verification when users log in. */


        @Bean
        public BCryptPasswordEncoder passwordEncoder() {
            return new BCryptPasswordEncoder();
        }




    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable()) // Disable CSRF
                .authorizeHttpRequests(auth -> auth
                        //.requestMatchers("/h2-console/**").permitAll() // Allow H2 Console
                        .anyRequest().permitAll() // ALLOW ALL REQUESTS
                )
                .headers(headers -> headers.frameOptions(frame -> frame.disable())) // Fix H2 Console UI
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

                .httpBasic(withDefaults());

        return http.build();
    }


}

