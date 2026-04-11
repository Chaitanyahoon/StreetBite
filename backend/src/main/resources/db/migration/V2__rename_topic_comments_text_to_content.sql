-- Flyway migration: align topic_comments schema with current JPA entity
-- Handles legacy `text` column in two cases:
-- 1) rename text => content when content is absent
-- 2) copy text => content then drop text when content already exists

SET @has_text = (
    SELECT COUNT(*)
    FROM information_schema.COLUMNS
    WHERE table_schema = DATABASE()
      AND table_name = 'topic_comments'
      AND column_name = 'text'
);

SET @has_content = (
    SELECT COUNT(*)
    FROM information_schema.COLUMNS
    WHERE table_schema = DATABASE()
      AND table_name = 'topic_comments'
      AND column_name = 'content'
);

IF @has_text > 0 AND @has_content = 0 THEN
    ALTER TABLE topic_comments CHANGE COLUMN `text` `content` TEXT NOT NULL;
ELSEIF @has_text > 0 AND @has_content > 0 THEN
    UPDATE topic_comments
    SET content = COALESCE(NULLIF(content, ''), `text`)
    WHERE `text` IS NOT NULL AND (content IS NULL OR content = '');
    ALTER TABLE topic_comments DROP COLUMN `text`;
END IF;
