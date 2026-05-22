package com.streetbite.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.streetbite.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.io.File;
import java.io.FileWriter;
import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.Duration;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Service
@EnableScheduling
public class DatabaseBackupService {

    private static final Logger logger = LoggerFactory.getLogger(DatabaseBackupService.class);
    private static final String BACKUP_DIR_NAME = "backups";
    private static final int MAX_BACKUP_RETENTION_DAYS = 7;

    private final UserRepository userRepository;
    private final VendorRepository vendorRepository;
    private final ReviewRepository reviewRepository;
    private final AnnouncementRepository announcementRepository;
    private final FavoriteRepository favoriteRepository;
    private final NewsletterSubscriberRepository newsletterSubscriberRepository;
    
    private final ObjectMapper objectMapper;
    private final HttpClient httpClient;

    public DatabaseBackupService(
            UserRepository userRepository,
            VendorRepository vendorRepository,
            ReviewRepository reviewRepository,
            AnnouncementRepository announcementRepository,
            FavoriteRepository favoriteRepository,
            NewsletterSubscriberRepository newsletterSubscriberRepository) {
        this.userRepository = userRepository;
        this.vendorRepository = vendorRepository;
        this.reviewRepository = reviewRepository;
        this.announcementRepository = announcementRepository;
        this.favoriteRepository = favoriteRepository;
        this.newsletterSubscriberRepository = newsletterSubscriberRepository;

        // Configure ObjectMapper to cleanly serialize local date-times
        this.objectMapper = new ObjectMapper()
                .registerModule(new JavaTimeModule())
                .configure(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS, false)
                .enable(SerializationFeature.INDENT_OUTPUT);

        this.httpClient = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(10))
                .build();
    }

    /**
     * Scheduled Job: Run daily database backup and diagnostic integrity checks at 2:00 AM
     */
    @Scheduled(cron = "0 0 2 * * ?")
    public void runScheduledBackup() {
        logger.info("Starting automated database daily backup run...");
        performBackup();
    }

    /**
     * Core backup logic
     */
    public Map<String, Object> performBackup() {
        Map<String, Object> backupSummary = new HashMap<>();
        String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd_HH-mm-ss"));
        backupSummary.put("timestamp", timestamp);

        try {
            // 1. Create backups folder in current active workspace directory
            Path backupPath = Paths.get(System.getProperty("user.dir"), BACKUP_DIR_NAME);
            if (!Files.exists(backupPath)) {
                Files.createDirectories(backupPath);
                logger.info("Created daily backups storage directory at: {}", backupPath.toAbsolutePath());
            }

            // 2. Programmatically fetch records from database for reliable container-safe snapshots
            logger.info("Querying system tables for database serialization...");
            
            long userCount = userRepository.count();
            long vendorCount = vendorRepository.count();
            long reviewCount = reviewRepository.count();
            long announcementCount = announcementRepository.count();
            long favoriteCount = favoriteRepository.count();
            long subscriberCount = newsletterSubscriberRepository.count();

            Map<String, Object> dbSnapshot = new LinkedHashMap<>();
            dbSnapshot.put("metadata", Map.of(
                "exportedAt", LocalDateTime.now().toString(),
                "counts", Map.of(
                    "users", userCount,
                    "vendors", vendorCount,
                    "reviews", reviewCount,
                    "announcements", announcementCount,
                    "favorites", favoriteCount,
                    "subscribers", subscriberCount
                )
            ));

            dbSnapshot.put("users", userRepository.findAll());
            dbSnapshot.put("vendors", vendorRepository.findAll());
            dbSnapshot.put("reviews", reviewRepository.findAll());
            dbSnapshot.put("announcements", announcementRepository.findAll());
            dbSnapshot.put("favorites", favoriteRepository.findAll());
            dbSnapshot.put("subscribers", newsletterSubscriberRepository.findAll());

            // 3. Serialize data snapshot to formatted JSON file
            String fileName = "streetbite_db_backup_" + timestamp + ".json";
            File backupFile = new File(backupPath.toFile(), fileName);
            
            try (FileWriter writer = new FileWriter(backupFile)) {
                objectMapper.writeValue(writer, dbSnapshot);
            }

            logger.info("✅ Database backup file successfully created: {} (Size: {} bytes)", 
                    backupFile.getAbsolutePath(), backupFile.length());

            backupSummary.put("status", "SUCCESS");
            backupSummary.put("file", backupFile.getName());
            backupSummary.put("size_bytes", backupFile.length());
            backupSummary.put("counts", Map.of(
                "users", userCount,
                "vendors", vendorCount,
                "reviews", reviewCount,
                "announcements", announcementCount,
                "favorites", favoriteCount,
                "subscribers", subscriberCount
            ));

            // 4. Perform log rotation (Retention management for last 7 days)
            rotateBackups(backupPath.toFile());

            // 5. Post result to external telemetry monitor if configured
            dispatchTelemetry(backupSummary);

        } catch (Exception e) {
            logger.error("❌ Critical database backup failure encountered: ", e);
            backupSummary.put("status", "FAILED");
            backupSummary.put("error", e.getMessage());
            dispatchTelemetry(backupSummary);
        }

        return backupSummary;
    }

    /**
     * Log rotation handler: Keep only the most recent 7 database backup JSON snapshots
     */
    private void rotateBackups(File folder) {
        logger.info("Executing backup rotation scans...");
        File[] files = folder.listFiles((dir, name) -> name.startsWith("streetbite_db_backup_") && name.endsWith(".json"));
        
        if (files == null || files.length <= MAX_BACKUP_RETENTION_DAYS) {
            logger.info("Current backup count ({}) is within limit ({}). Skipping rotation.", 
                    files != null ? files.length : 0, MAX_BACKUP_RETENTION_DAYS);
            return;
        }

        // Sort files by last modified time (oldest first)
        Arrays.sort(files, Comparator.comparingLong(File::lastModified));

        int filesToDelete = files.length - MAX_BACKUP_RETENTION_DAYS;
        logger.info("Found {} files. Deleting {} oldest backup snapshots...", files.length, filesToDelete);

        for (int i = 0; i < filesToDelete; i++) {
            File toDelete = files[i];
            if (toDelete.delete()) {
                logger.info("🧹 Deleted rotated backup file: {}", toDelete.getName());
            } else {
                logger.warn("⚠️ Failed to delete rotated backup file: {}", toDelete.getName());
            }
        }
    }

    /**
     * Dispatch telemetry webhook notifications if BACKUP_TELEMETRY_URL environment variable is set
     */
    private void dispatchTelemetry(Map<String, Object> summary) {
        String telemetryUrl = System.getenv("BACKUP_TELEMETRY_URL");
        if (telemetryUrl == null || telemetryUrl.trim().isEmpty()) {
            logger.info("No external backup telemetry URL defined. Skipping post.");
            return;
        }

        try {
            logger.info("Posting backup diagnostic details to telemetry hook: {}", telemetryUrl);
            String jsonPayload = objectMapper.writeValueAsString(summary);

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(telemetryUrl))
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(jsonPayload))
                    .build();

            httpClient.sendAsync(request, HttpResponse.BodyHandlers.ofString())
                    .thenAccept(res -> logger.info("Telemetry post successfully completed (Status: {})", res.statusCode()))
                    .exceptionally(err -> {
                        logger.warn("⚠️ Failed to post database backup telemetry: {}", err.getMessage());
                        return null;
                    });

        } catch (Exception e) {
            logger.warn("⚠️ Telemetry payload formulation failed: {}", e.getMessage());
        }
    }
}
