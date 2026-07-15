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
public class AnnouncementDTO {
    private Long id;
    private Long clubId;
    private String clubName;
    private String title;
    private String content;
    private LocalDateTime createdAt;
}
