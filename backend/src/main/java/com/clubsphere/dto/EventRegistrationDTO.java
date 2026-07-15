package com.clubsphere.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EventRegistrationDTO {
    private Long id;
    private Long eventId;
    private Long userId;
    private String status;
    private boolean attended;
    private LocalDateTime registeredAt;
    private UserDetails user;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UserDetails {
        private Long id;
        private String firstName;
        private String lastName;
        private String email;
        private String username;
    }
}
