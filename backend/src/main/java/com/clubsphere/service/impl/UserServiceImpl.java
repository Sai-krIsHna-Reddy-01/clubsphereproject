package com.clubsphere.service.impl;

import com.clubsphere.dto.LoginRequest;
import com.clubsphere.dto.LoginResponse;
import com.clubsphere.dto.RegisterRequest;
import com.clubsphere.dto.UserDTO;
import com.clubsphere.entity.Role;
import com.clubsphere.entity.User;
import com.clubsphere.exception.BadRequestException;
import com.clubsphere.exception.ResourceNotFoundException;
import com.clubsphere.repository.UserRepository;
import com.clubsphere.security.JwtService;
import com.clubsphere.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final UserDetailsService userDetailsService;

    @Override
    public LoginResponse register(RegisterRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new BadRequestException("Username is already taken");
        }
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email is already registered");
        }

        Role userRole;
        try {
            userRole = Role.valueOf(request.getRole().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new BadRequestException("Invalid role. Role must be ROLE_ADMIN, ROLE_CLUB_MANAGER, or ROLE_STUDENT");
        }

        User user = User.builder()
                .username(request.getUsername())
                .password(passwordEncoder.encode(request.getPassword()))
                .email(request.getEmail())
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .role(userRole)
                .enabled(true)
                .build();

        userRepository.save(user);

        UserDetails userDetails = userDetailsService.loadUserByUsername(user.getUsername());
        String token = jwtService.generateToken(userDetails);

        return LoginResponse.builder()
                .token(token)
                .user(UserDTO.builder()
                        .id(user.getId())
                        .username(user.getUsername())
                        .email(user.getEmail())
                        .firstName(user.getFirstName())
                        .lastName(user.getLastName())
                        .role(user.getRole().name())
                        .profilePictureUrl(user.getProfilePictureUrl() != null ? user.getProfilePictureUrl() : "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=120")
                        .build())
                .build();
    }

    @Override
    public LoginResponse login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getUsername(),
                        request.getPassword()
                )
        );

        User user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new BadRequestException("Invalid username or password"));

        UserDetails userDetails = userDetailsService.loadUserByUsername(user.getUsername());
        String token = jwtService.generateToken(userDetails);

        return LoginResponse.builder()
                .token(token)
                .user(UserDTO.builder()
                        .id(user.getId())
                        .username(user.getUsername())
                        .email(user.getEmail())
                        .firstName(user.getFirstName())
                        .lastName(user.getLastName())
                        .role(user.getRole().name())
                        .profilePictureUrl(user.getProfilePictureUrl() != null ? user.getProfilePictureUrl() : "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=120")
                        .build())
                .build();
    }

    @Override
    public UserDTO getProfile(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with username: " + username));
        return convertToUserDTO(user);
    }

    @Override
    public UserDTO updateProfile(String username, UserDTO userDTO) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with username: " + username));

        if (userDTO.getFirstName() != null) user.setFirstName(userDTO.getFirstName());
        if (userDTO.getLastName() != null) user.setLastName(userDTO.getLastName());
        if (userDTO.getEmail() != null && !user.getEmail().equalsIgnoreCase(userDTO.getEmail())) {
            if (userRepository.existsByEmail(userDTO.getEmail())) {
                throw new BadRequestException("Email already taken");
            }
            user.setEmail(userDTO.getEmail());
        }
        if (userDTO.getProfilePictureUrl() != null) user.setProfilePictureUrl(userDTO.getProfilePictureUrl());

        User updatedUser = userRepository.save(user);
        return convertToUserDTO(updatedUser);
    }

    private UserDTO convertToUserDTO(User user) {
        return UserDTO.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .role(user.getRole().name())
                .profilePictureUrl(user.getProfilePictureUrl() != null ? user.getProfilePictureUrl() : "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=120")
                .build();
    }

    @Override
    public java.util.List<UserDTO> getAllUsers() {
        return userRepository.findAll().stream()
                .map(this::convertToUserDTO)
                .collect(java.util.stream.Collectors.toList());
    }

    @Override
    public void updateUserRole(Long userId, String roleName) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
        
        try {
            Role role = Role.valueOf(roleName.toUpperCase());
            user.setRole(role);
            userRepository.save(user);
        } catch (IllegalArgumentException e) {
            throw new BadRequestException("Invalid role. Role must be ROLE_ADMIN, ROLE_CLUB_MANAGER, or ROLE_STUDENT");
        }
    }
}
