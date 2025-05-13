package com.Rahul.taskify.Configuration;

import com.Rahul.taskify.Security.JwtAuthFilter;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
// --- No need for AuthenticationManager imports here unless defining a bean ---
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
// import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity; // Keeping this commented out based on previous attempts
import org.springframework.security.config.http.SessionCreationPolicy;
// --- No need for UserDetailsService import here unless defining the auth manager bean ---
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

// --- Imports needed for the fix ---
import org.springframework.http.converter.HttpMessageConverter;
import org.springframework.http.converter.ByteArrayHttpMessageConverter;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
// --- End Imports needed for the fix ---

import java.util.List;


// @EnableWebSecurity // Keep commented out
@EnableMethodSecurity
@Configuration
// --- ADD 'implements WebMvcConfigurer' ---
public class UserConfiguration implements WebMvcConfigurer {

    private static final Logger logger = LoggerFactory.getLogger(UserConfiguration.class);

//    // ========= START: ADDED SECTION FOR MESSAGE CONVERTER FIX =========
//    @Override
//    public void extendMessageConverters(List<HttpMessageConverter<?>> converters) {
//        logger.info("--- Extending message converters. Initial default count: {} ---", converters.size());
//        logger.info("--- Explicitly adding ByteArrayHttpMessageConverter ---");
//        // Explicitly add the converter that handles raw byte arrays and InputStreams for binary types.
//        converters.add(new ByteArrayHttpMessageConverter());
//    }
//    // ========= END: ADDED SECTION FOR MESSAGE CONVERTER FIX ===========


    // ========= Your existing Security beans (UNCHANGED) =========
    @Bean
    public BCryptPasswordEncoder passwordEncoder() {

        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http, JwtAuthFilter jwtAuthFilter) throws Exception {
        // Your existing SecurityFilterChain bean - Stays exactly the same
        http
                .csrf(csrf -> csrf
                        .ignoringRequestMatchers("/h2-console/**")
                        .disable())
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(org.springframework.http.HttpMethod.POST, "/api/tts/generate").permitAll()
                        .requestMatchers("/users/register", "/users/login").permitAll()
                        .requestMatchers("/admin/**").hasRole("ADMIN")
                        .requestMatchers("/users/**").hasAnyRole("USER", "ADMIN")
                        .anyRequest().authenticated()
                )
                .headers(headers -> headers.frameOptions(frameOptions -> frameOptions.disable()))
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
    // ========= End of your existing Security beans =========

} // End of class