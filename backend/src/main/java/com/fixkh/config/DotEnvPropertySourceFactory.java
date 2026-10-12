package com.fixkh.config;

import org.springframework.core.env.PropertiesPropertySource;
import org.springframework.core.env.PropertySource;
import org.springframework.core.io.support.EncodedResource;
import org.springframework.core.io.support.PropertySourceFactory;
import java.io.BufferedReader;
import java.io.IOException;
import java.util.Properties;

/** Reads simple KEY=value .env files, including quoted values, without logging secrets. */
public class DotEnvPropertySourceFactory implements PropertySourceFactory {
    @Override
    public PropertySource<?> createPropertySource(String name, EncodedResource resource) throws IOException {
        Properties properties = new Properties();
        try (BufferedReader reader = new BufferedReader(resource.getReader())) {
            String line;
            while ((line = reader.readLine()) != null) {
                String trimmed = line.trim();
                if (trimmed.isEmpty() || trimmed.startsWith("#")) continue;
                int separator = trimmed.indexOf('=');
                if (separator < 1) continue;
                String key = trimmed.substring(0, separator).trim();
                if (!key.matches("[A-Za-z_][A-Za-z0-9_]*")) continue;
                String value = trimmed.substring(separator + 1).trim();
                if (value.length() >= 2 && ((value.startsWith("\"") && value.endsWith("\""))
                        || (value.startsWith("'") && value.endsWith("'")))) value = value.substring(1, value.length() - 1);
                properties.setProperty(key, value);
            }
        }
        return new PropertiesPropertySource(name == null ? "backend-dotenv" : name, properties);
    }
}
