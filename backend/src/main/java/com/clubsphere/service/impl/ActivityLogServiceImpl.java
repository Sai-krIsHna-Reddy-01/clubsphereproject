package com.clubsphere.service.impl;

import com.clubsphere.dto.ActivityLogDTO;
import com.clubsphere.entity.ActivityLog;
import com.clubsphere.entity.User;
import com.clubsphere.repository.ActivityLogRepository;
import com.clubsphere.repository.UserRepository;
import com.clubsphere.service.ActivityLogService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ActivityLogServiceImpl implements ActivityLogService {

    private final ActivityLogRepository activityLogRepository;
    private final UserRepository userRepository;

    @Override
    public void log(String username, String action, String ipAddress) {
        User user = null;
        if (username != null) {
            user = userRepository.findByUsername(username).orElse(null);
        }

        ActivityLog log = ActivityLog.builder()
                .user(user)
                .action(action)
                .ipAddress(ipAddress != null ? ipAddress : "127.0.0.1")
                .build();

        activityLogRepository.save(log);
    }

    @Override
    public List<ActivityLogDTO> getAllLogs() {
        return activityLogRepository.findAllByOrderByTimestampDesc().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    private ActivityLogDTO convertToDTO(ActivityLog log) {
        return ActivityLogDTO.builder()
                .id(log.getId())
                .userId(log.getUser() != null ? log.getUser().getId() : null)
                .username(log.getUser() != null ? log.getUser().getUsername() : "Guest")
                .action(log.getAction())
                .ipAddress(log.getIpAddress())
                .timestamp(log.getTimestamp())
                .build();
    }
}
