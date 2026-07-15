package com.clubsphere.controller;

import com.clubsphere.service.CertificateService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/certificates")
@RequiredArgsConstructor
public class CertificateController {

    private final CertificateService certificateService;
    private final com.clubsphere.repository.UserRepository userRepository;

    @GetMapping
    public ResponseEntity<java.util.List<com.clubsphere.dto.CertificateDTO>> getCertificates() {
        org.springframework.security.core.Authentication auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
        String username = auth.getName();
        
        boolean isStudent = auth.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_STUDENT"));
        
        if (isStudent) {
            com.clubsphere.entity.User user = userRepository.findByUsername(username)
                    .orElseThrow(() -> new com.clubsphere.exception.ResourceNotFoundException("User not found: " + username));
            return ResponseEntity.ok(certificateService.getCertificatesByUserId(user.getId()));
        } else {
            return ResponseEntity.ok(certificateService.getAllCertificates());
        }
    }

    @GetMapping(value = "/download/{code}", produces = MediaType.TEXT_HTML_VALUE)
    public ResponseEntity<String> downloadCertificate(@PathVariable String code) {
        return ResponseEntity.ok(certificateService.getCertificateHtml(code));
    }
}
