package com.clubsphere.service;

import com.clubsphere.dto.ActivityLogDTO;

import java.util.List;

public interface ActivityLogService {
    void log(String username, String action, String ipAddress);
    List<ActivityLogDTO> getAllLogs();
}
