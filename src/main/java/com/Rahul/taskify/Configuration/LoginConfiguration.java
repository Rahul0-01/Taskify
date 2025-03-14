/* this is the configuration file to authenticate the user ...
here i used AuthenticationManager of spring security which is used to check the username and
userpassword. but if you want to add more things to check to authenticate the user(like email id or etc) then
we have to cutomize this .. use chat gpt for more


now simply inject it inside service and use there
 */





package com.Rahul.taskify.Configuration;

import com.Rahul.taskify.Service.CustomUserDetailService;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.ProviderManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class LoginConfiguration {

    @Bean
    public AuthenticationManager authenticationManager(CustomUserDetailService userDetailsService, PasswordEncoder passwordEncoder) {
        DaoAuthenticationProvider provider = new DaoAuthenticationProvider();
        provider.setUserDetailsService(userDetailsService);
        provider.setPasswordEncoder(passwordEncoder);
        return new ProviderManager(provider);
    }
}
