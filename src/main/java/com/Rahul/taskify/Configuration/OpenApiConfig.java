package com.Rahul.taskify.Configuration;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Value("${app.api.title:Taskify API}")
    private String title;

    @Value("${app.api.description:Taskify backend API documentation}")
    private String description;

    @Value("${app.api.version:1.0.0}")
    private String version;

    @Bean
    public OpenAPI taskifyOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title(title)
                        .description(description)
                        .version(version))
                // Optional: JWT security in Swagger UI so you can "Authorize" with a Bearer token
                .schemaRequirement("bearer-jwt",
                        new SecurityScheme()
                                .type(SecurityScheme.Type.HTTP)
                                .scheme("bearer")
                                .bearerFormat("JWT"))
                .addSecurityItem(new SecurityRequirement().addList("bearer-jwt"));
    }
}
