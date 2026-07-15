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
public class CertificateDTO {
    private Long id;
    private Long eventId;
    private Long userId;
    private String certificateCode;
    private LocalDateTime issuedAt;
    private String downloadUrl;
    private String eventTitle;
    private String eventDate;
    private String studentName;
}
