package com.Rahul.taskify.Configuration;

import jakarta.servlet.*;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import java.io.IOException;

@Component
@Order(Ordered.HIGHEST_PRECEDENCE)
public class CustomCorsFilter implements Filter {

    @Value("${app.env:prod}")
    private String env;

    private static final String LOCALHOST_ORIGIN = "http://localhost:3000";

    @Override
    public void doFilter(ServletRequest req, ServletResponse res, FilterChain chain)
            throws IOException, ServletException {

        HttpServletRequest request = (HttpServletRequest) req;
        HttpServletResponse response = (HttpServletResponse) res;

        // --------------------------------------------------------------------
        // 🔥 IN PRODUCTION (app.env = prod)
        // Do NOT set ANY CORS headers here. API Gateway handles ALL CORS.
        // --------------------------------------------------------------------
        if (!"local".equals(env)) {
            chain.doFilter(req, res);
            return;
        }

        // --------------------------------------------------------------------
        // 🔥 IN LOCAL MODE (app.env = local)
        // Backend needs to set CORS headers for localhost frontend only.
        // --------------------------------------------------------------------
        String origin = request.getHeader("Origin");

        if (LOCALHOST_ORIGIN.equals(origin)) {
            response.setHeader("Access-Control-Allow-Origin", origin);
        }

        response.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
        response.setHeader("Access-Control-Allow-Headers", "authorization, content-type");
        response.setHeader("Access-Control-Allow-Credentials", "true");

        // Handle preflight
        if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {
            response.setStatus(HttpServletResponse.SC_OK);
            return;
        }

        chain.doFilter(req, res);
    }
}
