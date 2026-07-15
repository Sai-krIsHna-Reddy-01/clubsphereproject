package com.clubsphere.config;

import com.clubsphere.entity.Announcement;
import com.clubsphere.entity.Club;
import com.clubsphere.entity.Event;
import com.clubsphere.entity.Role;
import com.clubsphere.entity.User;
import com.clubsphere.repository.AnnouncementRepository;
import com.clubsphere.repository.ClubRepository;
import com.clubsphere.repository.EventRepository;
import com.clubsphere.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
@RequiredArgsConstructor
public class CommandLineDataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final ClubRepository clubRepository;
    private final EventRepository eventRepository;
    private final PasswordEncoder passwordEncoder;
    private final AnnouncementRepository announcementRepository;
    private final com.clubsphere.repository.MembershipRepository membershipRepository;

    @Override
    public void run(String... args) throws Exception {
        seedUsers();
        seedClubsAndEvents();
        seedAnnouncements();
    }

    private void seedUsers() {
        if (!userRepository.existsByUsername("admin")) {
            User admin = User.builder()
                    .username("admin")
                    .password(passwordEncoder.encode("admin123"))
                    .email("admin@clubsphere.com")
                    .firstName("Admin")
                    .lastName("User")
                    .role(Role.ROLE_ADMIN)
                    .enabled(true)
                    .build();
            userRepository.save(admin);
        }

        if (!userRepository.existsByUsername("manager")) {
            User manager = User.builder()
                    .username("manager")
                    .password(passwordEncoder.encode("manager123"))
                    .email("manager@clubsphere.com")
                    .firstName("Club")
                    .lastName("Manager")
                    .role(Role.ROLE_CLUB_MANAGER)
                    .enabled(true)
                    .build();
            userRepository.save(manager);
        }

        if (!userRepository.existsByUsername("student")) {
            User student = User.builder()
                    .username("student")
                    .password(passwordEncoder.encode("student123"))
                    .email("student@clubsphere.com")
                    .firstName("Student")
                    .lastName("User")
                    .role(Role.ROLE_STUDENT)
                    .enabled(true)
                    .build();
            userRepository.save(student);
        }
    }

    private void seedClubsAndEvents() {
        if (clubRepository.count() == 0) {
            User manager = userRepository.findByUsername("manager").orElse(null);
            Long managerId = manager != null ? manager.getId() : null;

            Club codingClub = Club.builder()
                    .clubName("Coding Club")
                    .description("For students interested in software development, algorithms, and technology.")
                    .category("Technology")
                    .facultyAdvisor("Dr. Smith")
                    .status("APPROVED")
                    .creatorId(managerId)
                    .build();
            codingClub = clubRepository.save(codingClub);

            Club dramaClub = Club.builder()
                    .clubName("Drama Club")
                    .description("Exposing students to the performing arts and theatre production.")
                    .category("Arts")
                    .facultyAdvisor("Prof. Higgins")
                    .status("APPROVED")
                    .creatorId(managerId)
                    .build();
            dramaClub = clubRepository.save(dramaClub);

            Club sportsClub = Club.builder()
                    .clubName("Sports Club")
                    .description("Promoting physical fitness, sportsmanship, and teamwork through various sports.")
                    .category("Sports")
                    .facultyAdvisor("Coach Miller")
                    .status("APPROVED")
                    .creatorId(managerId)
                    .build();
            sportsClub = clubRepository.save(sportsClub);

            if (manager != null) {
                com.clubsphere.entity.Membership m1 = com.clubsphere.entity.Membership.builder()
                        .club(codingClub).user(manager).status("APPROVED").build();
                com.clubsphere.entity.Membership m2 = com.clubsphere.entity.Membership.builder()
                        .club(dramaClub).user(manager).status("APPROVED").build();
                com.clubsphere.entity.Membership m3 = com.clubsphere.entity.Membership.builder()
                        .club(sportsClub).user(manager).status("APPROVED").build();
                membershipRepository.save(m1);
                membershipRepository.save(m2);
                membershipRepository.save(m3);
            }

            User student = userRepository.findByUsername("student").orElse(null);
            if (student != null) {
                com.clubsphere.entity.Membership ms = com.clubsphere.entity.Membership.builder()
                        .club(codingClub).user(student).status("APPROVED").build();
                membershipRepository.save(ms);
            }

            if (eventRepository.count() == 0) {
                Event hackathon = Event.builder()
                        .title("Spring Hackathon 2026")
                        .description("24-hour coding marathon to solve real-world problems.")
                        .venue("Tech Hall A")
                        .eventDate(LocalDateTime.now().plusDays(2))
                        .status("UPCOMING")
                        .club(codingClub)
                        .build();
                eventRepository.save(hackathon);

                Event talk = Event.builder()
                        .title("AI Workshop")
                        .description("Introduction to generative AI and neural networks.")
                        .venue("Seminar Room 2")
                        .eventDate(LocalDateTime.now().minusDays(5))
                        .status("COMPLETED")
                        .club(codingClub)
                        .build();
                eventRepository.save(talk);

                Event play = Event.builder()
                        .title("Shakespeare Night")
                        .description("Annual drama production showcasing Romeo & Juliet.")
                        .venue("Main Auditorium")
                        .eventDate(LocalDateTime.now().plusDays(10))
                        .status("UPCOMING")
                        .club(dramaClub)
                        .build();
                eventRepository.save(play);

                Event audition = Event.builder()
                        .title("Drama Auditions")
                        .description("Auditions for upcoming fall musical production.")
                        .venue("Drama Lab")
                        .eventDate(LocalDateTime.now().plusDays(1))
                        .status("UPCOMING")
                        .club(dramaClub)
                        .build();
                eventRepository.save(audition);

                Event football = Event.builder()
                        .title("Inter-departmental Football Cup")
                        .description("Thrilling matches between departments.")
                        .venue("Sports Field")
                        .eventDate(LocalDateTime.now().plusDays(5))
                        .status("UPCOMING")
                        .club(sportsClub)
                        .build();
                eventRepository.save(football);
            }
        }
    }

    private void seedAnnouncements() {
        if (announcementRepository.count() == 0) {
            Announcement welcome = Announcement.builder()
                    .title("Welcome to ClubSphere!")
                    .content("Explore amazing student clubs, register for exciting events, and collaborate seamlessly!")
                    .build();
            announcementRepository.save(welcome);
        }
    }
}
