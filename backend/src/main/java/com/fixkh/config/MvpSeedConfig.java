package com.fixkh.config;

import com.fixkh.entity.Report;
import com.fixkh.entity.ReportCategory;
import com.fixkh.entity.ReportImage;
import com.fixkh.entity.Role;
import com.fixkh.entity.User;
import com.fixkh.repository.ReportImageRepository;
import com.fixkh.repository.ReportRepository;
import com.fixkh.repository.UserRepository;
import com.fixkh.storage.ImageStorage;
import org.springframework.boot.ApplicationRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ClassPathResource;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.nio.file.NoSuchFileException;
import java.io.InputStream;
import java.util.UUID;

@Configuration
@ConditionalOnProperty(name = "fixkh.mvp-seed.enabled", havingValue = "true")
public class MvpSeedConfig {
    private static final UUID AUTHOR_ID = UUID.fromString("7a5eb89f-afdb-413e-aa2a-58fbfb652001");

    private record Example(UUID reportId, UUID imageId, String title, String description,
                           ReportCategory category, double latitude, double longitude,
                           String province, String district, String imageFile) {}

    private static final Example[] EXAMPLES = {
            new Example(UUID.fromString("7a5eb89f-afdb-413e-aa2a-58fbfb652101"),
                    UUID.fromString("7a5eb89f-afdb-413e-aa2a-58fbfb652201"),
                    "ផ្លូវខូច មានរណ្តៅធំ",
                    "There's a deep pothole on this stretch of road, and motorbikes have to swerve around it. ពេលភ្លៀង រណ្តៅនេះពេញទឹក មើលមិនឃើញទេ។ សូមជួយពិនិត្យផង។\n\nDemo example: generated photo and approximate map pin. This incident has not been verified.",
                    ReportCategory.ROAD_DAMAGE, 11.54954, 104.91844,
                    "Phnom Penh", "Chamkarmon", "road-damage.png"),
            new Example(UUID.fromString("7a5eb89f-afdb-413e-aa2a-58fbfb652102"),
                    UUID.fromString("7a5eb89f-afdb-413e-aa2a-58fbfb652202"),
                    "Drain blocked after the rain",
                    "ទឹកដក់នៅតាមចិញ្ចើមផ្លូវក្រោយភ្លៀង ព្រោះស្លឹកឈើ និងសំរាមស្ទះមាត់លូ។ People walking past have to step into the road to get around it. សូមជួយសម្អាតលូផង។\n\nDemo example: generated photo and approximate map pin. This incident has not been verified.",
                    ReportCategory.DRAINAGE, 13.38505, 103.85227,
                    "Siem Reap", "Siem Reap City", "drainage.png"),
            new Example(UUID.fromString("7a5eb89f-afdb-413e-aa2a-58fbfb652103"),
                    UUID.fromString("7a5eb89f-afdb-413e-aa2a-58fbfb652203"),
                    "សំរាមកកកុញក្បែរធុងសាធារណៈ",
                    "The bin looks full, and rubbish bags have been left beside it. មានក្លិនមិនល្អ ហើយសំរាមរាយប៉ាយលើចិញ្ចើមផ្លូវ។ Could the collection team please check this spot?\n\nDemo example: generated photo and approximate map pin. This incident has not been verified.",
                    ReportCategory.GARBAGE, 13.10203, 103.19976,
                    "Battambang", "Battambang Municipality", "garbage.png")
    };

    @Bean
    ApplicationRunner seedMvpReports(UserRepository users, ReportRepository reports,
                                     ReportImageRepository images, ImageStorage storage,
                                     PasswordEncoder passwordEncoder,
                                     @Value("${fixkh.mvp-seed.refresh:false}") boolean refresh) {
        return args -> {
            User author = users.findById(AUTHOR_ID).orElseGet(() -> {
                User user = new User();
                user.setId(AUTHOR_ID);
                user.setNickname("FixKH MVP Demo");
                user.setEmail("mvp-examples@fixkh.invalid");
                user.setPasswordHash(passwordEncoder.encode(UUID.randomUUID().toString()));
                user.setRole(Role.CITIZEN);
                user.setBio("Illustrative MVP examples only. These posts and images do not document verified incidents.");
                return users.saveAndFlush(user);
            });

            for (Example example : EXAMPLES) {
                Report report = reports.findById(example.reportId()).orElseGet(() -> {
                    Report item = new Report();
                    item.setId(example.reportId());
                    item.setAuthor(author);
                    item.setTitle(example.title());
                    item.setDescription(example.description());
                    item.setCategory(example.category());
                    item.setLatitude(example.latitude());
                    item.setLongitude(example.longitude());
                    item.setProvince(example.province());
                    item.setDistrict(example.district());
                    item.setAddress("MVP demo pin — approximate district center");
                    return reports.saveAndFlush(item);
                });
                if (refresh && report.getAuthor().getId().equals(AUTHOR_ID)) {
                    report.setTitle(example.title());
                    report.setDescription(example.description());
                    reports.saveAndFlush(report);
                }

                String key = example.imageId() + ".png";
                try {
                    storage.read(key);
                } catch (NoSuchFileException missing) {
                    try (InputStream source = new ClassPathResource("mvp-seed/" + example.imageFile())
                            .getInputStream()) {
                        storage.save(key, source.readAllBytes());
                    }
                }
                if (!images.existsById(example.imageId())) {
                    ReportImage image = new ReportImage();
                    image.setId(example.imageId());
                    image.setReport(report);
                    image.setStorageKey(key);
                    image.setContentType("image/png");
                    images.saveAndFlush(image);
                }
            }
            System.out.println(refresh
                    ? "MVP examples refreshed: titles and descriptions updated on seed-owned reports."
                    : "MVP seed ready: 3 labeled example reports with local images (existing records preserved).");
        };
    }
}
