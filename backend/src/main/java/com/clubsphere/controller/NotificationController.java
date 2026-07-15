package com.clubsphere.controller;

import com.clubsphere.dto.NotificationDTO;
import com.clubsphere.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    @GetMapping
    public ResponseEntity<List<NotificationDTO>> getNotifications() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return ResponseEntity.ok(notificationService.getNotificationsForUser(auth.getName()));
    }

    @PutMapping("/mark-read")
    public ResponseEntity<Void> markAllAsRead() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        notificationService.markAllAsRead(auth.getName());
        return ResponseEntity.ok().build();
    }
}
