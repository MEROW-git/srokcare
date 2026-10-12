package com.fixkh;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.PropertySource;
import com.fixkh.config.DotEnvPropertySourceFactory;

@SpringBootApplication
@PropertySource(value = "file:.env", ignoreResourceNotFound = true, factory = DotEnvPropertySourceFactory.class)
public class FixKhApplication {
    public static void main(String[] args) { SpringApplication.run(FixKhApplication.class, args); }
}
