package com.clubsphere.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MembershipDTO {

    private Long id;

    @NotNull(message = "User ID is required")
    private Long userId;

    private String username;

    @NotNull(message = "Club ID is required")
    private Long clubId;

    private String clubName;

    private LocalDateTime joinedDate;

    @NotBlank(message = "Status is required")
    private String status; // PENDING, APPROVED, REJECTED
}
