package com.clubsphere.service.impl;

import com.clubsphere.dto.NotificationDTO;
import com.clubsphere.entity.Notification;
import com.clubsphere.entity.User;
import com.clubsphere.exception.ResourceNotFoundException;
import com.clubsphere.repository.NotificationRepository;
import com.clubsphere.repository.UserRepository;
import com.clubsphere.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class NotificationServiceImpl implements NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    @Override
    public List<NotificationDTO> getNotificationsForUser(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with username: " + username));

        return notificationRepository.findByUserIdOrderByCreatedAtDesc(user.getId()).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void markAllAsRead(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with username: " + username));

        List<Notification> unread = notificationRepository.findByUserIdAndIsRead(user.getId(), false);
        for (Notification notification : unread) {
            notification.setRead(true);
        }
        notificationRepository.saveAll(unread);
    }

    @Override
    @Transactional
    public void createNotification(Long userId, String message) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        Notification notification = Notification.builder()
                .user(user)
                .message(message)
                .isRead(false)
                .build();

        notificationRepository.save(notification);
    }

    private NotificationDTO convertToDTO(Notification n) {
        return NotificationDTO.builder()
                .id(n.getId())
                .userId(n.getUser().getId())
                .message(n.getMessage())
                .isRead(n.isRead())
                .createdAt(n.getCreatedAt())
                .build();
    }
}
