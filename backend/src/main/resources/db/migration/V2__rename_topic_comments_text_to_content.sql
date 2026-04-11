-- Flyway migration: align topic_comments schema with current JPA entity
-- Handles legacy `text` column using prepared statements to avoid syntax errors outside stored procedures.

SET @dbname = DATABASE();

-- 1) Copy text => content if both exist
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM information_schema.COLUMNS
    WHERE table_schema = @dbname AND table_name = 'topic_comments' AND column_name = 'text'
  ) > 0 AND (
    SELECT COUNT(*) FROM information_schema.COLUMNS
    WHERE table_schema = @dbname AND table_name = 'topic_comments' AND column_name = 'content'
  ) > 0,
  'UPDATE topic_comments SET content = COALESCE(NULLIF(content, ''''), `text`) WHERE `text` IS NOT NULL AND (content IS NULL OR content = '''')',
  'SELECT 1'
));
PREPARE moveData FROM @preparedStatement;
EXECUTE moveData;
DEALLOCATE PREPARE moveData;

-- 2) Drop `text` if both exist
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM information_schema.COLUMNS
    WHERE table_schema = @dbname AND table_name = 'topic_comments' AND column_name = 'text'
  ) > 0 AND (
    SELECT COUNT(*) FROM information_schema.COLUMNS
    WHERE table_schema = @dbname AND table_name = 'topic_comments' AND column_name = 'content'
  ) > 0,
  'ALTER TABLE topic_comments DROP COLUMN `text`',
  'SELECT 1'
));
PREPARE dropCol FROM @preparedStatement;
EXECUTE dropCol;
DEALLOCATE PREPARE dropCol;

-- 3) Rename `text` to `content` if `text` exists but `content` does not
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM information_schema.COLUMNS
    WHERE table_schema = @dbname AND table_name = 'topic_comments' AND column_name = 'text'
  ) > 0 AND (
    SELECT COUNT(*) FROM information_schema.COLUMNS
    WHERE table_schema = @dbname AND table_name = 'topic_comments' AND column_name = 'content'
  ) = 0,
  'ALTER TABLE topic_comments CHANGE COLUMN `text` `content` TEXT NOT NULL',
  'SELECT 1'
));
PREPARE renameCol FROM @preparedStatement;
EXECUTE renameCol;
DEALLOCATE PREPARE renameCol;
