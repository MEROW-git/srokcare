package com.fixkh.storage;
import java.io.IOException;
public interface ImageStorage {
    void save(String key, byte[] bytes) throws IOException;
    byte[] read(String key) throws IOException;
    void delete(String key) throws IOException;
}
