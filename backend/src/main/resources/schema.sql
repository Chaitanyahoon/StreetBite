-- StreetBite Database Schema
-- Automaticaly executed by Spring Boot on startup

-- USERS TABLE
CREATE TABLE IF NOT EXISTS users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    display_name VARCHAR(255),
    phone_number VARCHAR(50),
    profile_picture VARCHAR(500),
    reset_password_token VARCHAR(255),
    reset_password_token_expiry DATETIME,
    email_verified BOOLEAN DEFAULT FALSE,
    email_verification_code_hash VARCHAR(255),
    email_verification_code_expiry DATETIME,
    role ENUM('USER', 'VENDOR', 'ADMIN') NOT NULL DEFAULT 'USER',
    zodiac_sign VARCHAR(50),
    xp INT DEFAULT 0,
    level INT DEFAULT 1,
    streak INT DEFAULT 0,
    last_check_in DATE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. VENDORS TABLE
CREATE TABLE IF NOT EXISTS vendors (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    owner_id BIGINT,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE,
    description TEXT,
    cuisine VARCHAR(255),
    address VARCHAR(500),
    latitude DOUBLE,
    longitude DOUBLE,
    rating DOUBLE DEFAULT 0.0,
    review_count INT DEFAULT 0,
    average_rating DOUBLE DEFAULT 0.0,
    phone VARCHAR(50),
    hours VARCHAR(255),
    banner_image_data LONGTEXT,
    display_image_data LONGTEXT,
    is_active BOOLEAN DEFAULT TRUE,
    status VARCHAR(50) DEFAULT 'PENDING',
    created_at DATETIME,
    updated_at DATETIME,
    FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. VENDOR IMAGES
CREATE TABLE IF NOT EXISTS vendor_images (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    vendor_id BIGINT NOT NULL,
    image_url VARCHAR(500) NOT NULL,
    FOREIGN KEY (vendor_id) REFERENCES vendors(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4. MENU ITEMS
CREATE TABLE IF NOT EXISTS menu_items (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    vendor_id BIGINT NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2),
    category VARCHAR(100),
    image_data LONGTEXT,
    is_available BOOLEAN DEFAULT TRUE,
    preparation_time INT,
    created_at DATETIME,
    updated_at DATETIME,
    FOREIGN KEY (vendor_id) REFERENCES vendors(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 5. REVIEWS
CREATE TABLE IF NOT EXISTS reviews (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    vendor_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    rating INT,
    comment TEXT,
    created_at DATETIME,
    FOREIGN KEY (vendor_id) REFERENCES vendors(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 6. REVIEW IMAGES
CREATE TABLE IF NOT EXISTS review_images (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    review_id BIGINT NOT NULL,
    image_url VARCHAR(500) NOT NULL,
    FOREIGN KEY (review_id) REFERENCES reviews(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 7. ORDERS
CREATE TABLE IF NOT EXISTS orders (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    vendor_id BIGINT NOT NULL,
    total_amount DECIMAL(10, 2),
    status VARCHAR(50),
    created_at DATETIME,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (vendor_id) REFERENCES vendors(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 8. ORDER ITEMS
CREATE TABLE IF NOT EXISTS order_items (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    order_id BIGINT NOT NULL,
    menu_item_id BIGINT NOT NULL,
    quantity INT,
    price_at_time DECIMAL(10, 2),
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (menu_item_id) REFERENCES menu_items(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

SET @dbname = DATABASE();

SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = @dbname
      AND TABLE_NAME = 'users'
      AND COLUMN_NAME = 'email_verified'
  ) > 0,
  'SELECT 1',
  'ALTER TABLE users ADD COLUMN email_verified BOOLEAN DEFAULT FALSE'
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = @dbname
      AND TABLE_NAME = 'users'
      AND COLUMN_NAME = 'email_verification_code_hash'
  ) > 0,
  'SELECT 1',
  'ALTER TABLE users ADD COLUMN email_verification_code_hash VARCHAR(255) NULL'
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = @dbname
      AND TABLE_NAME = 'users'
      AND COLUMN_NAME = 'email_verification_code_expiry'
  ) > 0,
  'SELECT 1',
  'ALTER TABLE users ADD COLUMN email_verification_code_expiry DATETIME NULL'
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

CREATE TABLE IF NOT EXISTS favorites (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    vendor_id BIGINT NOT NULL,
    created_at DATETIME,
    CONSTRAINT uk_favorites_user_vendor UNIQUE (user_id, vendor_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (vendor_id) REFERENCES vendors(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

SET @preparedStatement = (
  SELECT IF(
    EXISTS(
      SELECT 1
      FROM INFORMATION_SCHEMA.TABLES
      WHERE TABLE_SCHEMA = @dbname
        AND TABLE_NAME = 'user_favorites'
    ),
    'INSERT IGNORE INTO favorites (user_id, vendor_id, created_at) SELECT user_id, vendor_id, CURRENT_TIMESTAMP FROM user_favorites',
    'SELECT 1'
  )
);
PREPARE copyLegacyFavorites FROM @preparedStatement;
EXECUTE copyLegacyFavorites;
DEALLOCATE PREPARE copyLegacyFavorites;

-- 10. PROMOTIONS
CREATE TABLE IF NOT EXISTS promotions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    vendor_id BIGINT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    promo_code VARCHAR(100) UNIQUE,
    discount_type VARCHAR(50),
    discount_value DECIMAL(10, 2),
    min_order_value DECIMAL(10, 2),
    max_uses INT,
    current_uses INT DEFAULT 0,
    start_date DATETIME,
    end_date DATETIME,
    is_active BOOLEAN DEFAULT TRUE,
    created_at DATETIME,
    updated_at DATETIME,
    FOREIGN KEY (vendor_id) REFERENCES vendors(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 11. GEOCODE CACHE
CREATE TABLE IF NOT EXISTS geocode_cache (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    address VARCHAR(500) NOT NULL UNIQUE,
    latitude DOUBLE NOT NULL,
    longitude DOUBLE NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 12. REPORTS
CREATE TABLE IF NOT EXISTS reports (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    reporter_id BIGINT,
    reported_id BIGINT,
    type VARCHAR(50),
    category VARCHAR(50),
    subject VARCHAR(255),
    description TEXT,
    email VARCHAR(255),
    role VARCHAR(50),
    reason VARCHAR(255),
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    created_at DATETIME NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 13. ANNOUNCEMENTS
CREATE TABLE IF NOT EXISTS announcements (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    message VARCHAR(1000) NOT NULL,
    type VARCHAR(50) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at DATETIME
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 14. HOT TOPICS
CREATE TABLE IF NOT EXISTS hot_topics (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    image_url VARCHAR(500),
    is_active BOOLEAN DEFAULT TRUE,
    is_approved BOOLEAN DEFAULT FALSE,
    created_by_id BIGINT,
    created_by_display_name VARCHAR(255),
    created_at DATETIME,
    updated_at DATETIME,
    FOREIGN KEY (created_by_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

SET @dbname = DATABASE();

SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = @dbname
      AND TABLE_NAME = 'vendors'
      AND COLUMN_NAME = 'slug'
  ) > 0,
  'SELECT 1',
  'ALTER TABLE vendors ADD COLUMN slug VARCHAR(255) NULL'
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS
    WHERE TABLE_SCHEMA = @dbname
      AND TABLE_NAME = 'vendors'
      AND INDEX_NAME = 'uk_vendors_slug'
  ) > 0,
  'SELECT 1',
  'ALTER TABLE vendors ADD CONSTRAINT uk_vendors_slug UNIQUE (slug)'
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- Bring older hot_topics tables up to date before JPA validation runs.
SET @dbname = DATABASE();
SET @tablename = 'hot_topics';

SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = @dbname
      AND TABLE_NAME = @tablename
      AND COLUMN_NAME = 'is_approved'
  ) > 0,
  'SELECT 1',
  CONCAT('ALTER TABLE ', @tablename, ' ADD COLUMN is_approved BOOLEAN DEFAULT FALSE')
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = @dbname
      AND TABLE_NAME = @tablename
      AND COLUMN_NAME = 'created_by_id'
  ) > 0,
  'SELECT 1',
  CONCAT('ALTER TABLE ', @tablename, ' ADD COLUMN created_by_id BIGINT NULL')
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = @dbname
      AND TABLE_NAME = @tablename
      AND COLUMN_NAME = 'created_by_display_name'
  ) > 0,
  'SELECT 1',
  CONCAT('ALTER TABLE ', @tablename, ' ADD COLUMN created_by_display_name VARCHAR(255) NULL')
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS
    WHERE TABLE_SCHEMA = @dbname
      AND TABLE_NAME = @tablename
      AND CONSTRAINT_NAME = 'fk_hot_topics_created_by'
  ) > 0,
  'SELECT 1',
  CONCAT(
    'ALTER TABLE ', @tablename,
    ' ADD CONSTRAINT fk_hot_topics_created_by FOREIGN KEY (created_by_id) REFERENCES users(id) ON DELETE SET NULL'
  )
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- 15. TOPIC COMMENTS
CREATE TABLE IF NOT EXISTS topic_comments (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    topic_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    content TEXT NOT NULL,
    created_at DATETIME,
    FOREIGN KEY (topic_id) REFERENCES hot_topics(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 16. TOPIC LIKES
CREATE TABLE IF NOT EXISTS topic_likes (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    topic_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    created_at DATETIME,
    UNIQUE KEY (topic_id, user_id),
    FOREIGN KEY (topic_id) REFERENCES hot_topics(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 17. ANALYTICS EVENTS
CREATE TABLE IF NOT EXISTS analytics_events (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    vendor_id BIGINT,
    user_id BIGINT,
    item_id BIGINT,
    event_type VARCHAR(255),
    timestamp DATETIME,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = @dbname
      AND TABLE_NAME = 'analytics_events'
      AND COLUMN_NAME = 'vendor_id'
  ) > 0,
  'SELECT 1',
  'ALTER TABLE analytics_events ADD COLUMN vendor_id BIGINT NULL'
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = @dbname
      AND TABLE_NAME = 'analytics_events'
      AND COLUMN_NAME = 'item_id'
  ) > 0,
  'SELECT 1',
  'ALTER TABLE analytics_events ADD COLUMN item_id BIGINT NULL'
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = @dbname
      AND TABLE_NAME = 'analytics_events'
      AND COLUMN_NAME = 'timestamp'
  ) > 0,
  'SELECT 1',
  'ALTER TABLE analytics_events ADD COLUMN timestamp DATETIME NULL'
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = @dbname
      AND TABLE_NAME = 'analytics_events'
      AND COLUMN_NAME = 'created_at'
  ) > 0,
  'UPDATE analytics_events SET timestamp = COALESCE(timestamp, created_at) WHERE timestamp IS NULL',
  'SELECT 1'
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- 18. USER DEVICES
CREATE TABLE IF NOT EXISTS user_devices (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    fcm_token VARCHAR(255) NOT NULL,
    device_type VARCHAR(50),
    created_at DATETIME,
    updated_at DATETIME,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = @dbname
      AND TABLE_NAME = 'user_devices'
      AND COLUMN_NAME = 'fcm_token'
  ) > 0,
  'SELECT 1',
  'ALTER TABLE user_devices ADD COLUMN fcm_token VARCHAR(255) NULL'
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = @dbname
      AND TABLE_NAME = 'user_devices'
      AND COLUMN_NAME = 'created_at'
  ) > 0,
  'SELECT 1',
  'ALTER TABLE user_devices ADD COLUMN created_at DATETIME NULL'
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = @dbname
      AND TABLE_NAME = 'user_devices'
      AND COLUMN_NAME = 'updated_at'
  ) > 0,
  'SELECT 1',
  'ALTER TABLE user_devices ADD COLUMN updated_at DATETIME NULL'
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = @dbname
      AND TABLE_NAME = 'user_devices'
      AND COLUMN_NAME = 'device_token'
  ) > 0,
  'UPDATE user_devices SET fcm_token = COALESCE(fcm_token, device_token) WHERE fcm_token IS NULL',
  'SELECT 1'
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = @dbname
      AND TABLE_NAME = 'user_devices'
      AND COLUMN_NAME = 'last_active'
  ) > 0,
  'UPDATE user_devices SET created_at = COALESCE(created_at, last_active, CURRENT_TIMESTAMP), updated_at = COALESCE(updated_at, last_active, CURRENT_TIMESTAMP) WHERE created_at IS NULL OR updated_at IS NULL',
  'UPDATE user_devices SET created_at = COALESCE(created_at, CURRENT_TIMESTAMP), updated_at = COALESCE(updated_at, CURRENT_TIMESTAMP) WHERE created_at IS NULL OR updated_at IS NULL'
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS
    WHERE TABLE_SCHEMA = @dbname
      AND TABLE_NAME = 'user_devices'
      AND INDEX_NAME = 'uk_user_devices_fcm_token'
  ) > 0,
  'SELECT 1',
  'ALTER TABLE user_devices ADD CONSTRAINT uk_user_devices_fcm_token UNIQUE (fcm_token)'
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

CREATE TABLE IF NOT EXISTS newsletter_subscribers (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    subscribed_at DATETIME,
    is_active BOOLEAN DEFAULT TRUE,
    unsubscribe_token VARCHAR(255)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
