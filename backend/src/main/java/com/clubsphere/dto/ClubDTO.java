package com.clubsphere.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ClubDTO {

    private Long id;

    // Supports both DB and frontend models
    @JsonProperty("clubName")
    private String clubName;
    @JsonProperty("name")
    private String name;

    private String description;

    @NotBlank(message = "Category is required")
    private String category;

    private String facultyAdvisor;

    private LocalDateTime createdAt;

    private String bannerUrl;

    private String status;

    private Long creatorId;

    private String creatorName;

    private Integer membersCount;
}
