package com.Rahul.taskify;

import io.jsonwebtoken.*;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.Date;
import java.util.function.Function;

@Component
public class JwUtil {

    @Value("${jwt.secret}")
    private String SECRET_KEY;


    // this is used to convert secret key in the format of base64.....
    private  Key getSigningKey() {
        byte[] keyBytes = Decoders.BASE64.decode(SECRET_KEY);
        return Keys.hmacShaKeyFor(keyBytes);
    }

    // Generate Token
    public  String generateToken(String username) {
        return Jwts.builder()
                .setSubject(username)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + 10 * 60 * 60 * 1000)) // 10 hours
                .signWith(getSigningKey(), SignatureAlgorithm.HS256)
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
                    Jwts.parserBuilder()
                            .setSigningKey(getSigningKey())  // ✅ FIXED
                            .build()
                            .parseClaimsJws(token)
                            .getBody()
            );
        } catch (JwtException e) {
            throw new RuntimeException("Invalid JWT Token!");
        }
    }
}
