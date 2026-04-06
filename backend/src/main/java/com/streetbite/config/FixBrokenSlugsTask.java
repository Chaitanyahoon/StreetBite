package com.streetbite.config;

import com.streetbite.model.Vendor;
import com.streetbite.repository.VendorRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.List;

@Component
public class FixBrokenSlugsTask implements CommandLineRunner {

    private static final Logger logger = LoggerFactory.getLogger(FixBrokenSlugsTask.class);

    @Autowired
    private VendorRepository vendorRepository;

    @Override
    public void run(String... args) throws Exception {
        logger.info("Checking for broken vendor slugs...");
        List<Vendor> vendors = vendorRepository.findAll();
        int fixedCount = 0;

        for (Vendor vendor : vendors) {
            boolean needsFix = false;
            String currentSlug = vendor.getSlug();

            if (currentSlug == null || currentSlug.isBlank() || currentSlug.endsWith("-null")) {
                needsFix = true;
            }

            if (needsFix) {
                // By forcing slug to null and saving, @PreUpdate in Vendor entity will re-trigger 
                // generateSlug() which now correctly uses the ID or a timestamp.
                vendor.setSlug(null);
                vendorRepository.save(vendor);
                fixedCount++;
                logger.info("Fixed broken slug for Vendor ID: {} (Name: {})", vendor.getId(), vendor.getName());
            }
        }

        if (fixedCount > 0) {
            logger.info("Successfully fixed {} broken vendor slugs in the database.", fixedCount);
        } else {
            logger.info("No broken vendor slugs found.");
        }
    }
}
