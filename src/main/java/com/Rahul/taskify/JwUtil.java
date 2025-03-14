package com.Rahul.taskify;

import io.jsonwebtoken.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import java.util.Date;
import java.util.function.Function;

@Component
public class JwUtil {

    @Value("${jwt.secret}")
    private String SECRET_KEY;

    // Generate Token
    public String generateToken(String username) {
        return Jwts.builder()
                .setSubject(username)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + 10 * 60 * 60 * 1000)) // 10 hours
                .signWith(SignatureAlgorithm.HS256, SECRET_KEY)
                .compact();
    }

    // Validate Token
    public boolean validateToken(String token, UserDetails userDetails) {
        return userDetails.getUsername().equals(extractClaim(token, Claims::getSubject))
                && !extractClaim(token, Claims::getExpiration).before(new Date());
    }

    // Extract Claims
    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        try {
            return claimsResolver.apply(
                    Jwts.parser().setSigningKey(SECRET_KEY).parseClaimsJws(token).getBody()
            );
        } catch (JwtException e) {
            throw new RuntimeException("Invalid JWT Token!");
        }
    }
}
