package com.clubsphere.service;

import com.clubsphere.dto.LoginRequest;
import com.clubsphere.dto.LoginResponse;
import com.clubsphere.dto.RegisterRequest;

import com.clubsphere.dto.UserDTO;

public interface UserService {
    LoginResponse register(RegisterRequest request);
    LoginResponse login(LoginRequest request);
    UserDTO getProfile(String username);
    UserDTO updateProfile(String username, UserDTO userDTO);
    java.util.List<UserDTO> getAllUsers();
    void updateUserRole(Long userId, String roleName);
}
