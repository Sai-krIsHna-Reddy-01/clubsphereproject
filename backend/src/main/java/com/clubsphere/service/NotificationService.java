package com.clubsphere.service;

import com.clubsphere.dto.NotificationDTO;

import java.util.List;

public interface NotificationService {
    List<NotificationDTO> getNotificationsForUser(String username);
    void markAllAsRead(String username);
    void createNotification(Long userId, String message);
}
