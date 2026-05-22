package com.streetbite.service;

import com.google.firebase.FirebaseApp;
import com.google.firebase.cloud.StorageClient;
import com.google.cloud.storage.Blob;
import com.google.cloud.storage.Bucket;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.MalformedURLException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Set;
import java.util.UUID;

@Service
public class FileStorageService {

    private static final Set<String> ALLOWED_CONTENT_TYPES = Set.of(
            "image/jpeg",
            "image/png",
            "image/webp",
            "image/gif"
    );

    @Value("${firebase.storage.bucket:}")
    private String firebaseBucket;

    private final Path fileStorageLocation;

    public FileStorageService() {
        this.fileStorageLocation = Paths.get("uploads").toAbsolutePath().normalize();
        try {
            Files.createDirectories(this.fileStorageLocation);
        } catch (IOException ex) {
            throw new RuntimeException("Could not create the directory where the uploaded files will be stored.", ex);
        }
    }

    public String storeFile(MultipartFile file) {
        validateUpload(file);

        String originalFileName = StringUtils.cleanPath(file.getOriginalFilename());
        String fileExtension = "";
        if (originalFileName.contains(".")) {
            fileExtension = originalFileName.substring(originalFileName.lastIndexOf("."));
        }

        String fileName = UUID.randomUUID() + fileExtension;

        // Check if Firebase is active and a storage bucket is configured
        boolean isFirebaseConfigured = !FirebaseApp.getApps().isEmpty() && 
                firebaseBucket != null && !firebaseBucket.trim().isEmpty();

        if (isFirebaseConfigured) {
            try {
                String blobName = "uploads/" + fileName;
                Bucket bucket = StorageClient.getInstance().bucket(firebaseBucket);
                if (bucket != null) {
                    Blob blob = bucket.create(blobName, file.getInputStream(), file.getContentType());
                    System.out.println("✓ Uploaded file to Firebase Storage: " + blobName);
                    // Return the direct standard Firebase Storage Alt Media URL:
                    return String.format("https://firebasestorage.googleapis.com/v0/b/%s/o/%s?alt=media",
                            bucket.getName(), URLEncoder.encode(blobName, StandardCharsets.UTF_8));
                } else {
                    System.err.println("Firebase Storage Bucket '" + firebaseBucket + "' not found.");
                }
            } catch (Exception ex) {
                System.err.println("Firebase Storage upload failed, falling back to local storage. Error: " + ex.getMessage());
            }
        }

        // Local storage fallback
        Path targetLocation = fileStorageLocation.resolve(fileName).normalize();

        try {
            Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);
        } catch (IOException ex) {
            throw new RuntimeException("Could not upload file: " + ex.getMessage(), ex);
        }

        return "/api/files/download/" + fileName;
    }

    public Resource loadFileAsResource(String fileName) {
        try {
            Path filePath = fileStorageLocation.resolve(fileName).normalize();
            if (!filePath.startsWith(fileStorageLocation)) {
                throw new RuntimeException("Invalid file path");
            }

            Resource resource = new UrlResource(filePath.toUri());
            if (resource.exists()) {
                return resource;
            }

            throw new RuntimeException("File not found");
        } catch (MalformedURLException ex) {
            throw new RuntimeException("File not found", ex);
        }
    }

    public String probeContentType(Path filePath) {
        try {
            return Files.probeContentType(filePath);
        } catch (IOException ex) {
            return null;
        }
    }

    public Path resolvePath(String fileName) {
        return fileStorageLocation.resolve(fileName).normalize();
    }

    private void validateUpload(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("File is required");
        }

        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_CONTENT_TYPES.contains(contentType)) {
            throw new IllegalArgumentException("Only image uploads are allowed");
        }
    }
}
