package com.fixkh.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.Operation;
import io.swagger.v3.oas.models.PathItem;
import io.swagger.v3.oas.models.responses.ApiResponses;
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

class OpenApiConfigTest {
    @Test void documentsRelevantErrorResponses() {
        OpenAPI api = new OpenAPI()
                .path("/api/v1/auth/register", new PathItem().post(new Operation().responses(new ApiResponses())))
                .path("/api/v1/reports/{id}/images", new PathItem().post(new Operation().responses(new ApiResponses())));
        new OpenApiConfig().errorResponses().customise(api);
        assertNotNull(api.getPaths().get("/api/v1/auth/register").getPost().getResponses().get("409"));
        assertNull(api.getPaths().get("/api/v1/auth/register").getPost().getResponses().get("401"));
        assertNotNull(api.getPaths().get("/api/v1/reports/{id}/images").getPost().getResponses().get("413"));
    }
}
