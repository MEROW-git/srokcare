package com.fixkh.storage;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.regex.Pattern;

@Component
public class LocalImageStorage implements ImageStorage {
    private static final Pattern SAFE = Pattern.compile("[a-f0-9-]{36}\\.(jpg|png)");
    private final Path directory;
    public LocalImageStorage(@Value("${fixkh.upload-dir}") String path) { directory = Path.of(path).toAbsolutePath().normalize(); }
    private Path path(String key) {
        if (!SAFE.matcher(key).matches()) throw new IllegalArgumentException("Invalid image key");
        return directory.resolve(key);
    }
    public void save(String key, byte[] bytes) throws IOException {
        Files.createDirectories(directory);
        Files.write(path(key), bytes, java.nio.file.StandardOpenOption.CREATE_NEW);
    }
    public byte[] read(String key) throws IOException { return Files.readAllBytes(path(key)); }
    public void delete(String key) throws IOException { Files.deleteIfExists(path(key)); }
}
