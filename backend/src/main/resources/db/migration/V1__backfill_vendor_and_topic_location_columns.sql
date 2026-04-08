-- Idempotent migration for legacy databases where these columns may be missing.
SET @dbname = DATABASE();

-- vendors.banner_image_url
SET @preparedStatement = (SELECT IF(
  EXISTS(
    SELECT 1
    FROM INFORMATION_SCHEMA.TABLES
    WHERE TABLE_SCHEMA = @dbname
      AND TABLE_NAME = 'vendors'
  ) AND NOT EXISTS(
    SELECT 1
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = @dbname
      AND TABLE_NAME = 'vendors'
      AND COLUMN_NAME = 'banner_image_url'
  ),
  'ALTER TABLE vendors ADD COLUMN banner_image_url TEXT NULL',
  'SELECT 1'
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- vendors.display_image_url
SET @preparedStatement = (SELECT IF(
  EXISTS(
    SELECT 1
    FROM INFORMATION_SCHEMA.TABLES
    WHERE TABLE_SCHEMA = @dbname
      AND TABLE_NAME = 'vendors'
  ) AND NOT EXISTS(
    SELECT 1
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = @dbname
      AND TABLE_NAME = 'vendors'
      AND COLUMN_NAME = 'display_image_url'
  ),
  'ALTER TABLE vendors ADD COLUMN display_image_url TEXT NULL',
  'SELECT 1'
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- hot_topics.city_name
SET @preparedStatement = (SELECT IF(
  EXISTS(
    SELECT 1
    FROM INFORMATION_SCHEMA.TABLES
    WHERE TABLE_SCHEMA = @dbname
      AND TABLE_NAME = 'hot_topics'
  ) AND NOT EXISTS(
    SELECT 1
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = @dbname
      AND TABLE_NAME = 'hot_topics'
      AND COLUMN_NAME = 'city_name'
  ),
  'ALTER TABLE hot_topics ADD COLUMN city_name VARCHAR(120) NULL',
  'SELECT 1'
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- hot_topics.latitude
SET @preparedStatement = (SELECT IF(
  EXISTS(
    SELECT 1
    FROM INFORMATION_SCHEMA.TABLES
    WHERE TABLE_SCHEMA = @dbname
      AND TABLE_NAME = 'hot_topics'
  ) AND NOT EXISTS(
    SELECT 1
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = @dbname
      AND TABLE_NAME = 'hot_topics'
      AND COLUMN_NAME = 'latitude'
  ),
  'ALTER TABLE hot_topics ADD COLUMN latitude DOUBLE NULL',
  'SELECT 1'
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- hot_topics.longitude
SET @preparedStatement = (SELECT IF(
  EXISTS(
    SELECT 1
    FROM INFORMATION_SCHEMA.TABLES
    WHERE TABLE_SCHEMA = @dbname
      AND TABLE_NAME = 'hot_topics'
  ) AND NOT EXISTS(
    SELECT 1
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = @dbname
      AND TABLE_NAME = 'hot_topics'
      AND COLUMN_NAME = 'longitude'
  ),
  'ALTER TABLE hot_topics ADD COLUMN longitude DOUBLE NULL',
  'SELECT 1'
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;
