package com.clubsphere.service.impl;

import com.clubsphere.dto.CertificateDTO;
import com.clubsphere.entity.Certificate;
import com.clubsphere.entity.Event;
import com.clubsphere.entity.EventRegistration;
import com.clubsphere.exception.ResourceNotFoundException;
import com.clubsphere.repository.CertificateRepository;
import com.clubsphere.repository.EventRegistrationRepository;
import com.clubsphere.repository.EventRepository;
import com.clubsphere.service.CertificateService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CertificateServiceImpl implements CertificateService {

    private final CertificateRepository certificateRepository;
    private final EventRepository eventRepository;
    private final EventRegistrationRepository eventRegistrationRepository;

    @Override
    public List<CertificateDTO> getCertificatesByUserId(Long userId) {
        return certificateRepository.findByUserId(userId).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public String getCertificateHtml(String code) {
        Certificate cert = certificateRepository.findByCertificateCode(code)
                .orElseThrow(() -> new ResourceNotFoundException("Certificate not found with code: " + code));

        String studentName = cert.getUser().getFirstName() + " " + cert.getUser().getLastName();
        String eventTitle = cert.getEvent().getTitle();
        String dateStr = cert.getIssuedAt().toLocalDate().toString();

        return "<html>" +
                "<head><title>Certificate - " + code + "</title>" +
                "<style>" +
                "body { font-family: 'Georgia', serif; background-color: #f3f4f6; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; }" +
                ".certificate { width: 800px; height: 550px; background-color: #fff; border: 20px solid #1e3a8a; padding: 40px; box-sizing: border-box; text-align: center; box-shadow: 0 10px 25px rgba(0,0,0,0.1); position: relative; }" +
                ".certificate::after { content: ''; position: absolute; top: 10px; bottom: 10px; left: 10px; right: 10px; border: 2px solid #b45309; pointer-events: none; }" +
                "h1 { color: #1e3a8a; font-size: 42px; margin-top: 20px; font-weight: normal; }" +
                "h2 { color: #b45309; font-size: 20px; text-transform: uppercase; letter-spacing: 2px; }" +
                ".name { font-size: 32px; font-weight: bold; margin: 20px 0; border-bottom: 2px solid #e5e7eb; display: inline-block; padding-bottom: 5px; min-width: 300px; }" +
                ".text { font-size: 18px; line-height: 1.6; color: #4b5563; max-width: 600px; margin: 0 auto; }" +
                ".footer-section { display: flex; justify-content: space-between; margin-top: 50px; padding: 0 50px; }" +
                ".signature-box { border-top: 1px solid #9ca3af; width: 200px; padding-top: 5px; font-size: 14px; color: #4b5563; }" +
                ".code { font-family: monospace; font-size: 12px; color: #9ca3af; margin-top: 30px; }" +
                "</style></head>" +
                "<body>" +
                "<div class='certificate'>" +
                "<h2>Certificate of Excellence</h2>" +
                "<h1>ClubSphere Collaborator Award</h1>" +
                "<p class='text'>This is proudly presented to</p>" +
                "<div class='name'>" + studentName + "</div>" +
                "<p class='text'>for actively participating and completing the campus event: <br><strong>\"" + eventTitle + "\"</strong><br>organized with distinction by the student club community.</p>" +
                "<div class='footer-section'>" +
                "<div class='signature-box'>Club President Signature</div>" +
                "<div class='signature-box'>Staff Advisor Signature</div>" +
                "</div>" +
                "<div class='code'>Verification Code: " + code + " | Issued: " + dateStr + "</div>" +
                "</div>" +
                "</body>" +
                "</html>";
    }

    @Override
    public List<CertificateDTO> generateCertificatesForEvent(Long eventId) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new ResourceNotFoundException("Event not found with id: " + eventId));

        List<EventRegistration> attendees = eventRegistrationRepository.findByEventId(eventId).stream()
                .filter(reg -> reg.isAttended() && reg.getStatus().equals("REGISTERED"))
                .collect(Collectors.toList());

        List<Certificate> generated = new ArrayList<>();

        for (EventRegistration registration : attendees) {
            if (!certificateRepository.existsByEventIdAndUserId(eventId, registration.getUser().getId())) {
                String code = "CERT-" + eventId + "-" + registration.getUser().getId() + "-" + UUID.randomUUID().toString().substring(0, 4).toUpperCase();
                Certificate cert = Certificate.builder()
                        .event(event)
                        .user(registration.getUser())
                        .certificateCode(code)
                        .downloadUrl("/api/certificates/download/" + code)
                        .build();
                generated.add(certificateRepository.save(cert));
            }
        }

        return generated.stream().map(this::convertToDTO).collect(Collectors.toList());
    }

    @Override
    public List<CertificateDTO> getAllCertificates() {
        return certificateRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    private CertificateDTO convertToDTO(Certificate cert) {
        return CertificateDTO.builder()
                .id(cert.getId())
                .eventId(cert.getEvent().getId())
                .userId(cert.getUser().getId())
                .certificateCode(cert.getCertificateCode())
                .issuedAt(cert.getIssuedAt())
                .downloadUrl(cert.getDownloadUrl())
                .eventTitle(cert.getEvent().getTitle())
                .eventDate(cert.getEvent().getEventDate().toLocalDate().toString())
                .studentName(cert.getUser().getFirstName() + " " + cert.getUser().getLastName())
                .build();
    }
}
