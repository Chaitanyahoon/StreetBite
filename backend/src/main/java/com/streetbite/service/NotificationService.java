package com.streetbite.service;

import com.google.firebase.messaging.*;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class NotificationService {

    /**
     * Send notification to a specific device token
     */
    public void sendToToken(String fcmToken, String title, String body, Map<String, String> data) {
        try {
            Message.Builder messageBuilder = Message.builder()
                    .setToken(fcmToken)
                    .setNotification(Notification.builder()
                            .setTitle(title)
                            .setBody(body)
                            .build());

            if (data != null && !data.isEmpty()) {
                messageBuilder.putAllData(data);
            }

            String response = FirebaseMessaging.getInstance().send(messageBuilder.build());
            System.out.println("✅ Notification sent successfully: " + response);
        } catch (FirebaseMessagingException e) {
            System.err.println("❌ Failed to send notification: " + e.getMessage());
        }
    }

    /**
     * Send notification to multiple tokens
     */
    public void sendToMultipleTokens(List<String> fcmTokens, String title, String body, Map<String, String> data) {
        if (fcmTokens == null || fcmTokens.isEmpty()) {
            System.out.println("⚠️ No tokens to send notification to");
            return;
        }

        try {
            MulticastMessage.Builder messageBuilder = MulticastMessage.builder()
                    .addAllTokens(fcmTokens)
                    .setNotification(Notification.builder()
                            .setTitle(title)
                            .setBody(body)
                            .build());

            if (data != null && !data.isEmpty()) {
                messageBuilder.putAllData(data);
            }

            BatchResponse response = FirebaseMessaging.getInstance().sendEachForMulticast(messageBuilder.build());
            System.out.println("✅ Sent " + response.getSuccessCount() + " messages successfully");

            if (response.getFailureCount() > 0) {
                System.err.println("❌ Failed to send " + response.getFailureCount() + " messages");
            }
        } catch (FirebaseMessagingException e) {
            System.err.println("❌ Failed to send multicast notification: " + e.getMessage());
        }
    }

    /**
     * Send notification to a topic
     */
    public void sendToTopic(String topic, String title, String body, Map<String, String> data) {
        try {
            Message.Builder messageBuilder = Message.builder()
                    .setTopic(topic)
                    .setNotification(Notification.builder()
                            .setTitle(title)
                            .setBody(body)
                            .build());

            if (data != null && !data.isEmpty()) {
                messageBuilder.putAllData(data);
            }

            String response = FirebaseMessaging.getInstance().send(messageBuilder.build());
            System.out.println("✅ Topic notification sent: " + response);
        } catch (FirebaseMessagingException e) {
            System.err.println("❌ Failed to send topic notification: " + e.getMessage());
        }
    }

    /**
     * Subscribe tokens to a topic
     */
    public void subscribeToTopic(List<String> fcmTokens, String topic) {
        try {
            TopicManagementResponse response = FirebaseMessaging.getInstance()
                    .subscribeToTopic(fcmTokens, topic);
            System.out.println("✅ Subscribed " + response.getSuccessCount() + " tokens to topic: " + topic);
        } catch (FirebaseMessagingException e) {
            System.err.println("❌ Failed to subscribe to topic: " + e.getMessage());
        }
    }

    /**
     * Unsubscribe tokens from a topic
     */
    public void unsubscribeFromTopic(List<String> fcmTokens, String topic) {
        try {
            TopicManagementResponse response = FirebaseMessaging.getInstance()
                    .unsubscribeFromTopic(fcmTokens, topic);
            System.out.println("✅ Unsubscribed " + response.getSuccessCount() + " tokens from topic: " + topic);
        } catch (FirebaseMessagingException e) {
            System.err.println("❌ Failed to unsubscribe from topic: " + e.getMessage());
        }
    }

}
