package com.Rahul.taskify.Security;

import com.Rahul.taskify.JwUtil;
import com.Rahul.taskify.Service.CustomUserDetailService;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class JwtAuthFilter extends OncePerRequestFilter {

    private final JwUtil jwUtil;
    private final CustomUserDetailService userDetailsService;

    @Autowired
    public JwtAuthFilter(JwUtil jwUtil, CustomUserDetailService userDetailsService) {
        this.jwUtil = jwUtil;
        this.userDetailsService = userDetailsService;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        String path = request.getServletPath();

        // ✅ Skip JWT check for public endpoints
        if (path.startsWith("/users/login") ||
                path.startsWith("/users/register") ||
                path.startsWith("/users/refresh") ||
                path.startsWith("/v3/api-docs") ||
                path.startsWith("/swagger-ui")) {

            filterChain.doFilter(request, response);
            return;
        }

        // ✅ For all other requests, check token
        String token = extractToken(request);
        if (token != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            try {
                authenticateUser(token, request);
            } catch (JwtException e) {
                response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Invalid or Expired JWT Token");
                return;
            }
        }

        filterChain.doFilter(request, response);
    }


    private String extractToken(HttpServletRequest request) {
        String authHeader = request.getHeader("Authorization");
        return (authHeader != null && authHeader.startsWith("Bearer ")) ? authHeader.substring(7) : null;
    }

    private void authenticateUser(String token, HttpServletRequest request) {
        try {
            // Use safe extraction to handle expired tokens
            String username = jwUtil.extractClaimSafely(token, Claims::getSubject);
            UserDetails userDetails = userDetailsService.loadUserByUsername(username);
            System.out.println("Authorities from JWT: " + userDetails.getAuthorities());

            // Check if token is expired
            if (jwUtil.isTokenExpired(token)) {
                // Token is expired - let the request continue so frontend can handle 401
                // Don't set authentication, which will result in 401 response
                return;
            }

            if (jwUtil.validateToken(token, userDetails)) {
                UsernamePasswordAuthenticationToken authentication =
                        new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());

                authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                SecurityContextHolder.getContext().setAuthentication(authentication);
            }
        } catch (Exception e) {
            // For any other JWT parsing errors, let the request continue
            // This will result in 401 response that frontend can handle
            System.out.println("JWT parsing error: " + e.getMessage());
        }
    }
}
