package com.clubsphere.service.impl;

import com.clubsphere.dto.CertificateDTO;
import com.clubsphere.dto.EventDTO;
import com.clubsphere.dto.EventRegistrationDTO;
import com.clubsphere.entity.Club;
import com.clubsphere.entity.Event;
import com.clubsphere.entity.EventRegistration;
import com.clubsphere.entity.User;
import com.clubsphere.exception.BadRequestException;
import com.clubsphere.exception.ResourceNotFoundException;
import com.clubsphere.repository.ClubRepository;
import com.clubsphere.repository.EventRegistrationRepository;
import com.clubsphere.repository.EventRepository;
import com.clubsphere.repository.UserRepository;
import com.clubsphere.service.CertificateService;
import com.clubsphere.service.EventService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class EventServiceImpl implements EventService {

    private final EventRepository eventRepository;
    private final ClubRepository clubRepository;
    private final UserRepository userRepository;
    private final EventRegistrationRepository registrationRepository;
    private final CertificateService certificateService;

    @Override
    public List<EventDTO> getAllEvents() {
        return eventRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public EventDTO getEventById(Long id) {
        Event event = eventRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Event not found with id: " + id));
        return convertToDTO(event);
    }

    @Override
    public EventDTO createEvent(EventDTO eventDTO, String username) {
        Club club = clubRepository.findById(eventDTO.getClubId())
                .orElseThrow(() -> new ResourceNotFoundException("Club not found with id: " + eventDTO.getClubId()));

        Event event = Event.builder()
                .title(eventDTO.getTitle())
                .description(eventDTO.getDescription())
                .venue(eventDTO.getVenue() != null ? eventDTO.getVenue() : eventDTO.getLocation())
                .eventDate(eventDTO.getEventDate())
                .eventTime(eventDTO.getEventTime() != null ? eventDTO.getEventTime() : "09:00:00")
                .bannerUrl(eventDTO.getBannerUrl() != null ? eventDTO.getBannerUrl()
                        : "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&q=80&w=400")
                .status(eventDTO.getStatus() != null ? eventDTO.getStatus() : "UPCOMING")
                .club(club)
                .build();

        return convertToDTO(eventRepository.save(event));
    }

    @Override
    public EventDTO updateEvent(Long id, EventDTO eventDTO) {
        Event event = eventRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Event not found with id: " + id));

        Club club = clubRepository.findById(eventDTO.getClubId())
                .orElseThrow(() -> new ResourceNotFoundException("Club not found with id: " + eventDTO.getClubId()));

        event.setTitle(eventDTO.getTitle());
        event.setDescription(eventDTO.getDescription());
        event.setVenue(eventDTO.getVenue() != null ? eventDTO.getVenue() : eventDTO.getLocation());
        event.setEventDate(eventDTO.getEventDate());
        if (eventDTO.getEventTime() != null) event.setEventTime(eventDTO.getEventTime());
        if (eventDTO.getBannerUrl() != null) event.setBannerUrl(eventDTO.getBannerUrl());
        event.setStatus(eventDTO.getStatus());
        event.setClub(club);

        return convertToDTO(eventRepository.save(event));
    }

    @Override
    public void deleteEvent(Long id) {
        if (!eventRepository.existsById(id)) {
            throw new ResourceNotFoundException("Event not found with id: " + id);
        }
        eventRepository.deleteById(id);
    }

    @Override
    public EventRegistrationDTO registerForEvent(Long eventId, String username) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new ResourceNotFoundException("Event not found with id: " + eventId));

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + username));

        if (registrationRepository.existsByEventIdAndUserId(eventId, user.getId())) {
            throw new BadRequestException("You are already registered for this event.");
        }

        EventRegistration registration = EventRegistration.builder()
                .event(event)
                .user(user)
                .status("REGISTERED")
                .attended(false)
                .build();

        return convertToRegistrationDTO(registrationRepository.save(registration));
    }

    @Override
    public void cancelRegistration(Long eventId, String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + username));

        EventRegistration reg = registrationRepository.findByEventIdAndUserId(eventId, user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Registration not found."));

        reg.setStatus("CANCELLED");
        registrationRepository.save(reg);
    }

    @Override
    public List<EventRegistrationDTO> getEventRegistrations(Long eventId) {
        return registrationRepository.findByEventId(eventId).stream()
                .map(this::convertToRegistrationDTO)
                .collect(Collectors.toList());
    }

    @Override
    public void markAttendance(Long eventId, Map<Long, Boolean> attendance) {
        attendance.forEach((userId, attended) -> {
            registrationRepository.findByEventIdAndUserId(eventId, userId)
                    .ifPresent(reg -> {
                        reg.setAttended(attended);
                        registrationRepository.save(reg);
                    });
        });
    }

    @Override
    public List<CertificateDTO> generateCertificates(Long eventId) {
        return certificateService.generateCertificatesForEvent(eventId);
    }

    private EventDTO convertToDTO(Event event) {
        long registrationsCount = registrationRepository.findByEventId(event.getId()).stream()
                .filter(r -> r.getStatus().equals("REGISTERED")).count();

        return EventDTO.builder()
                .id(event.getId())
                .title(event.getTitle())
                .description(event.getDescription())
                .venue(event.getVenue())
                .location(event.getVenue())
                .eventDate(event.getEventDate())
                .eventTime(event.getEventTime())
                .bannerUrl(event.getBannerUrl() != null ? event.getBannerUrl()
                        : "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&q=80&w=400")
                .status(event.getStatus())
                .clubId(event.getClub().getId())
                .clubName(event.getClub().getClubName())
                .registrationsCount((int) registrationsCount)
                .build();
    }

    private EventRegistrationDTO convertToRegistrationDTO(EventRegistration reg) {
        return EventRegistrationDTO.builder()
                .id(reg.getId())
                .eventId(reg.getEvent().getId())
                .userId(reg.getUser().getId())
                .status(reg.getStatus())
                .attended(reg.isAttended())
                .registeredAt(reg.getRegisteredAt())
                .user(EventRegistrationDTO.UserDetails.builder()
                        .id(reg.getUser().getId())
                        .firstName(reg.getUser().getFirstName())
                        .lastName(reg.getUser().getLastName())
                        .email(reg.getUser().getEmail())
                        .username(reg.getUser().getUsername())
                        .build())
                .build();
    }
}
