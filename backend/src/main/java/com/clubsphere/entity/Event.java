package com.clubsphere.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "events")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Event {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Event title is required")
    @Column(nullable = false)
    private String title;

    @Column(length = 1000)
    private String description;

    @NotBlank(message = "Venue is required")
    @Column(nullable = false)
    private String venue;

    @NotNull(message = "Event date is required")
    @Column(name = "event_date", nullable = false)
    private LocalDateTime eventDate;

    @Column(name = "event_time")
    private String eventTime;

    @Column(name = "banner_url")
    private String bannerUrl;

    @NotBlank(message = "Status is required")
    @Column(nullable = false)
    private String status; // e.g. "UPCOMING", "COMPLETED", "CANCELLED"

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "club_id", nullable = false)
    @ToString.Exclude
    private Club club;
}
