package com.clubsphere.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "clubs")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Club {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Club name is required")
    @Column(name = "club_name", nullable = false, unique = true)
    private String clubName;

    @Column(length = 1000)
    private String description;

    @NotBlank(message = "Category is required")
    @Column(nullable = false)
    private String category;

    @NotBlank(message = "Faculty advisor is required")
    @Column(name = "faculty_advisor", nullable = false)
    private String facultyAdvisor;

    @Column(name = "banner_url")
    private String bannerUrl;

    @Builder.Default
    @Column(nullable = false)
    private String status = "PENDING";

    @Column(name = "creator_id")
    private Long creatorId;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @OneToMany(mappedBy = "club", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    @ToString.Exclude
    private List<Event> events = new ArrayList<>();

    @OneToMany(mappedBy = "club", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    @ToString.Exclude
    private List<Membership> memberships = new ArrayList<>();
}
