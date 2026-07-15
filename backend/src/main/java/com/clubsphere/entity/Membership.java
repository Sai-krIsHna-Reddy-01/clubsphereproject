package com.clubsphere.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "memberships")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Membership {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @ToString.Exclude
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "club_id", nullable = false)
    @ToString.Exclude
    private Club club;

    @CreationTimestamp
    @Column(name = "joined_date", nullable = false, updatable = false)
    private LocalDateTime joinedDate;

    @NotBlank(message = "Status is required")
    @Column(nullable = false)
    private String status; // e.g. "PENDING", "APPROVED", "REJECTED"
}
