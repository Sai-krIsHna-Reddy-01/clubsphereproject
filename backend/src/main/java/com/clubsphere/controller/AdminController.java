package com.clubsphere.controller;

import com.clubsphere.dto.ActivityLogDTO;
import com.clubsphere.dto.UserDTO;
import com.clubsphere.service.ActivityLogService;
import com.clubsphere.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/admin")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class AdminController {

    private final UserService userService;
    private final ActivityLogService logService;

    @GetMapping("/users")
    public ResponseEntity<List<UserDTO>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }

    @PutMapping("/users/{id}/role")
    public ResponseEntity<Void> updateUserRole(
            @PathVariable Long id,
            @RequestBody Map<String, String> body
    ) {
        String roleName = body.get("roleName");
        userService.updateUserRole(id, roleName);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/logs")
    public ResponseEntity<List<ActivityLogDTO>> getAllLogs() {
        return ResponseEntity.ok(logService.getAllLogs());
    }
}
