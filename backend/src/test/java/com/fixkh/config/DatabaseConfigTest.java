package com.fixkh.config;

import com.zaxxer.hikari.HikariDataSource;
import org.junit.jupiter.api.Test;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.support.EncodedResource;
import java.nio.charset.StandardCharsets;
import static org.junit.jupiter.api.Assertions.*;

class DatabaseConfigTest {
    @Test void postgresUriConvertsToJdbcWithoutCredentialsInUrl() {
        try (HikariDataSource source = (HikariDataSource) new DatabaseConfig().dataSource(
                "postgresql://test%2Buser:p%40ssword@db.example.com:5432/fixkh?sslmode=require", "ignored", "ignored")) {
            assertEquals("jdbc:postgresql://db.example.com:5432/fixkh?sslmode=require", source.getJdbcUrl());
            assertEquals("test+user", source.getUsername());
            assertEquals("p@ssword", source.getPassword());
        }
    }
    @Test void quotedDotEnvValuesAreUnwrapped() throws Exception {
        String data = "# comment\nJWT_SECRET=\"test-secret-value\"\nDB_URL=postgresql://user:pass@localhost/db\n";
        var source = new DotEnvPropertySourceFactory().createPropertySource("test",
                new EncodedResource(new ByteArrayResource(data.getBytes(StandardCharsets.UTF_8))));
        assertEquals("test-secret-value", source.getProperty("JWT_SECRET"));
        assertEquals("postgresql://user:pass@localhost/db", source.getProperty("DB_URL"));
    }
}
