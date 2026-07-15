package com.clubsphere.service;

import com.clubsphere.dto.CertificateDTO;
import com.clubsphere.dto.EventDTO;
import com.clubsphere.dto.EventRegistrationDTO;

import java.util.List;
import java.util.Map;

public interface EventService {
    List<EventDTO> getAllEvents();
    EventDTO getEventById(Long id);
    EventDTO createEvent(EventDTO eventDTO, String username);
    EventDTO updateEvent(Long id, EventDTO eventDTO);
    void deleteEvent(Long id);
    EventRegistrationDTO registerForEvent(Long eventId, String username);
    void cancelRegistration(Long eventId, String username);
    List<EventRegistrationDTO> getEventRegistrations(Long eventId);
    void markAttendance(Long eventId, Map<Long, Boolean> attendance);
    List<CertificateDTO> generateCertificates(Long eventId);
}
