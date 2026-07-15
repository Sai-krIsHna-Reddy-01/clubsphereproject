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
public class EventDTO {

    private Long id;

    @NotBlank(message = "Event title is required")
    private String title;

    private String description;

    // Supports both DB and frontend models
    private String venue;
    private String location;

    @NotNull(message = "Event date is required")
    private LocalDateTime eventDate;

    private String eventTime;

    private String status; // UPCOMING, COMPLETED, CANCELLED

    @NotNull(message = "Club ID is required")
    private Long clubId;

    private String clubName;

    private String bannerUrl;

    private Integer registrationsCount;

    // Helper getter/setter to bind location to venue for JPA mapping
    public String getLocation() {
        return location != null ? location : venue;
    }

    public String getVenue() {
        return venue != null ? venue : location;
    }
}
