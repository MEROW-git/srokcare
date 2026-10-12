package com.fixkh.config;

import com.zaxxer.hikari.HikariDataSource;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import javax.sql.DataSource;
import java.net.URI;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;

@Configuration
public class DatabaseConfig {
    @Bean DataSource dataSource(@Value("${DB_URL:jdbc:postgresql://localhost:5432/fixkh}") String configuredUrl,
            @Value("${DB_USERNAME:fixkh}") String configuredUser,
            @Value("${DB_PASSWORD:}") String configuredPassword) {
        String jdbcUrl = configuredUrl;
        String username = configuredUser;
        String password = configuredPassword;
        if (configuredUrl.startsWith("postgres://") || configuredUrl.startsWith("postgresql://")) {
            URI uri = URI.create(configuredUrl);
            if (uri.getHost() == null || uri.getRawUserInfo() == null || !uri.getRawUserInfo().contains(":"))
                throw new IllegalArgumentException("DB_URL PostgreSQL URI must contain host, username and password");
            String rawUserInfo = uri.getRawUserInfo();
            int separator = rawUserInfo.indexOf(':');
            username = decode(rawUserInfo.substring(0, separator));
            password = decode(rawUserInfo.substring(separator + 1));
            jdbcUrl = "jdbc:postgresql://" + uri.getHost() + (uri.getPort() < 0 ? "" : ":" + uri.getPort())
                    + uri.getRawPath() + (uri.getRawQuery() == null ? "" : "?" + uri.getRawQuery());
        } else if (!configuredUrl.startsWith("jdbc:postgresql://")) {
            throw new IllegalArgumentException("DB_URL must be a PostgreSQL URI or JDBC URL");
        }
        HikariDataSource source = new HikariDataSource();
        source.setJdbcUrl(jdbcUrl);
        source.setUsername(username);
        source.setPassword(password);
        source.setMaximumPoolSize(10);
        return source;
    }
    private String decode(String value) {
        return URLDecoder.decode(value.replace("+", "%2B"), StandardCharsets.UTF_8);
    }
}
