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
                    "ផ្លូវនេះមានរណ្តៅធំមួយ ហើយម៉ូតូត្រូវបើកគេចរាល់ពេល។ ពេលភ្លៀង ទឹកពេញរណ្តៅ មើលមិនឃើញទេ។ សូមជួយពិនិត្យ និងជួសជុលផង។\n\nគំរូសម្រាប់បង្ហាញ៖ រូបភាពត្រូវបានបង្កើតឡើង ហើយទីតាំងលើផែនទីជាចំណុចប្រហាក់ប្រហែល។ មិនទាន់មានការផ្ទៀងផ្ទាត់ហេតុការណ៍នេះទេ។",
                    ReportCategory.ROAD_DAMAGE, 11.54954, 104.91844,
                    "Phnom Penh", "Chamkarmon", "road-damage.png"),
            new Example(UUID.fromString("7a5eb89f-afdb-413e-aa2a-58fbfb652102"),
                    UUID.fromString("7a5eb89f-afdb-413e-aa2a-58fbfb652202"),
                    "Drain blocked after the rain",
                    "Water has been collecting along the footpath after each shower. Leaves and litter seem to be blocking the drain, so people have to step into the road to get past. Could someone clear it before the next heavy rain?\n\nDemo example: generated photo and approximate map pin. This incident has not been verified.",
                    ReportCategory.DRAINAGE, 13.38505, 103.85227,
                    "Siem Reap", "Siem Reap City", "drainage.png"),
            new Example(UUID.fromString("7a5eb89f-afdb-413e-aa2a-58fbfb652103"),
                    UUID.fromString("7a5eb89f-afdb-413e-aa2a-58fbfb652203"),
                    "សំរាមកកកុញក្បែរធុងសាធារណៈ",
                    "The bin looks full, and rubbish bags have been left beside it. មានក្លិនមិនល្អ ហើយសំរាមរាយប៉ាយលើចិញ្ចើមផ្លូវ។ Could the collection team please check this spot?\n\nDemo example: generated photo and approximate map pin. This incident has not been verified.",
                    ReportCategory.GARBAGE, 13.10203, 103.19976,
                    "Battambang", "Battambang Municipality", "garbage.png"),
            new Example(UUID.fromString("7a5eb89f-afdb-413e-aa2a-58fbfb652104"),
                    UUID.fromString("7a5eb89f-afdb-413e-aa2a-58fbfb652204"),
                    "ភ្លើងផ្លូវមួយដើមមិនភ្លឺ",
                    "ភ្លើងផ្លូវនៅក្បែរផ្ទះមិនភ្លឺប៉ុន្មានយប់ហើយ។ ពេលល្ងាចតំបន់នេះងងឹត ហើយអ្នកដើរឆ្លងកាត់ផ្លូវពិបាក។ សូមជួយពិនិត្យអំពូលផង។\n\nគំរូសម្រាប់បង្ហាញ៖ រូបភាពត្រូវបានបង្កើតឡើង ហើយទីតាំងលើផែនទីជាចំណុចប្រហាក់ប្រហែល។ មិនទាន់មានការផ្ទៀងផ្ទាត់ហេតុការណ៍នេះទេ។",
                    ReportCategory.STREETLIGHT, 11.56877, 104.91751,
                    "Phnom Penh", "Daun Penh", "streetlight.png"),
            new Example(UUID.fromString("7a5eb89f-afdb-413e-aa2a-58fbfb652105"),
                    UUID.fromString("7a5eb89f-afdb-413e-aa2a-58fbfb652205"),
                    "Water collecting along the road after rain",
                    "Rainwater is sitting along the roadside and covering part of the lane. Motorbikes slow down here, and people walking near the curb get splashed. Could the drainage on this stretch be checked?\n\nDemo example: generated photo and approximate map pin. This incident has not been verified.",
                    ReportCategory.FLOODING, 11.48232, 104.94413,
                    "Kandal", "Ta Khmau", "flooding.png")
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
                    : "MVP seed ready: " + EXAMPLES.length + " labeled example reports with local images (existing records preserved).");
        };
    }
}
