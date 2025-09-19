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

    @Value("${jwt.access.expiration}")
    private long accessTokenExpiration;

    @Value("${jwt.refresh.expiration}")
    private long refreshTokenExpiration;

    // === Signing Key ===
    private Key getSigningKey() {
        byte[] keyBytes = Decoders.BASE64.decode(SECRET_KEY);
        return Keys.hmacShaKeyFor(keyBytes);
    }

    // === Token generation ===
    public String generateAccessToken(String username) {
        return buildToken(username, accessTokenExpiration);
    }

    public String generateRefreshToken(String username) {
        return buildToken(username, refreshTokenExpiration);
    }

    private String buildToken(String username, long expirationMillis) {
        return Jwts.builder()
                .setSubject(username)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + expirationMillis))
                .signWith(getSigningKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    // === Validation ===
    public boolean validateToken(String token, UserDetails userDetails) {
        return userDetails.getUsername().equals(extractClaimSafely(token, Claims::getSubject))
                && !isTokenExpired(token);
    }

    public boolean validateToken(String token, String username) {
        final String tokenUsername = extractClaimSafely(token, Claims::getSubject);
        return (tokenUsername.equals(username) && !isTokenExpired(token));
    }

    public String extractUsername(String token) {
        return extractClaimSafely(token, Claims::getSubject);
    }

    public Date extractExpiration(String token) {
        return extractClaimSafely(token, Claims::getExpiration);
    }

    public boolean isTokenExpired(String token) {
        try {
            return extractExpiration(token).before(new Date());
        } catch (Exception e) {
            // If we can't extract expiration, consider it expired
            return true;
        }
    }

    // === Claims extraction ===
    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        try {
            return claimsResolver.apply(
                    Jwts.parserBuilder()
                            .setSigningKey(getSigningKey())
                            .build()
                            .parseClaimsJws(token)
                            .getBody()
            );
        } catch (JwtException e) {
            throw new RuntimeException("Invalid JWT Token!");
        }
    }

    // Safe extraction that doesn’t throw on expired tokens
    public <T> T extractClaimSafely(String token, Function<Claims, T> claimsResolver) {
        try {
            return claimsResolver.apply(
                    Jwts.parserBuilder()
                            .setSigningKey(getSigningKey())
                            .build()
                            .parseClaimsJws(token)
                            .getBody()
            );
        } catch (ExpiredJwtException e) {
            // ✅ Still return claims even if expired
            return claimsResolver.apply(e.getClaims());
        } catch (JwtException e) {
            throw new RuntimeException("Invalid JWT Token!");
        }
    }
}
