package com.fixkh.config;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.SecurityScheme;
import io.swagger.v3.oas.models.responses.ApiResponse;
import io.swagger.v3.oas.models.media.Content;
import io.swagger.v3.oas.models.media.Schema;
import io.swagger.v3.oas.models.media.MediaType;
import io.swagger.v3.oas.models.media.ObjectSchema;
import io.swagger.v3.oas.models.media.StringSchema;
import io.swagger.v3.oas.models.media.IntegerSchema;
import io.swagger.v3.oas.models.examples.Example;
import org.springdoc.core.customizers.OpenApiCustomizer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
@Configuration
public class OpenApiConfig {
    @Bean OpenAPI openAPI() {
        return new OpenAPI().info(new Info().title("FixKH API").version("v1")
                .description("Community reports are citizen submissions. Status changes are moderator actions, not proof of government acceptance."))
                .schemaRequirement("bearerAuth", new SecurityScheme().type(SecurityScheme.Type.HTTP).scheme("bearer").bearerFormat("JWT"));
    }
    @Bean OpenApiCustomizer errorResponses() {
        return api -> {
            if (api.getComponents() == null) api.setComponents(new Components());
            api.getComponents().addSchemas("ErrorResponse", new ObjectSchema()
                    .addProperty("timestamp", new StringSchema().format("date-time"))
                    .addProperty("status", new IntegerSchema().format("int32"))
                    .addProperty("error", new StringSchema())
                    .addProperty("message", new StringSchema())
                    .addProperty("path", new StringSchema()));
            api.getPaths().forEach((path, item) -> item.readOperationsMap().forEach((method, operation) -> {
                if (!path.endsWith("/health")) addError(operation, path, "400", "Invalid request or validation error");
                boolean publicGet = method == io.swagger.v3.oas.models.PathItem.HttpMethod.GET
                        && (path.equals("/api/v1/reports") || path.matches("/api/v1/reports/\\{id\\}(/comments|/images|/images/\\{imageId\\}/content)?"));
                boolean publicAuth = path.equals("/api/v1/auth/register") || path.equals("/api/v1/auth/verify-registration")
                        || path.equals("/api/v1/auth/login");
                if (!path.endsWith("/health") && !publicGet && !publicAuth) {
                    addError(operation, path, "401", "Authentication required or invalid token");
                    addError(operation, path, "403", "Insufficient permission");
                }
                if (path.contains("{id}") || path.contains("{imageId}")) addError(operation, path, "404", "Resource not found");
                if (path.equals("/api/v1/auth/register") || (path.endsWith("/support") && method == io.swagger.v3.oas.models.PathItem.HttpMethod.POST))
                    addError(operation, path, "409", "Duplicate email or support");
                if (path.equals("/api/v1/auth/register") || path.equals("/api/v1/auth/verify-registration"))
                    addError(operation, path, "429", "Too many code requests or incorrect attempts");
                if (path.equals("/api/v1/auth/register")) addError(operation, path, "503", "Email delivery unavailable");
                if (path.endsWith("/images") && method == io.swagger.v3.oas.models.PathItem.HttpMethod.POST)
                    addError(operation, path, "413", "Upload too large");
                addError(operation, path, "500", "Internal server error");
            }));
        };
    }
    private void addError(io.swagger.v3.oas.models.Operation operation, String path, String code, String description) {
        MediaType media = new MediaType().schema(new Schema<>().$ref("#/components/schemas/ErrorResponse"));
        media.addExamples("error", new Example().value(java.util.Map.of(
                "status", Integer.parseInt(code), "error", description,
                "message", description, "path", path)));
        operation.getResponses().putIfAbsent(code,
                new ApiResponse().description(description).content(new Content().addMediaType("application/json", media)));
    }
}
