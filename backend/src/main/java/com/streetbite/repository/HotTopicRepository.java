package com.streetbite.repository;

import com.streetbite.model.HotTopic;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface HotTopicRepository extends JpaRepository<HotTopic, Long> {
    List<HotTopic> findByIsActiveTrueOrderByCreatedAtDesc();
}
