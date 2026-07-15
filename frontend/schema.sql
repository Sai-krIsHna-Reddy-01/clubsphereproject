-- ClubSphere Database Schema (MySQL)
-- Senior Architect Production Ready Design

CREATE DATABASE IF NOT EXISTS clubsphere;
USE clubsphere;

-- 1. Roles table
CREATE TABLE IF NOT EXISTS roles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(20) NOT NULL UNIQUE
);

-- 2. Users table
CREATE TABLE IF NOT EXISTS users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    role_id INT NOT NULL,
    profile_picture_url VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE
);

-- 3. Clubs table
CREATE TABLE IF NOT EXISTS clubs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    category VARCHAR(50) NOT NULL,
    banner_url VARCHAR(255),
    status VARCHAR(20) DEFAULT 'PENDING', -- PENDING, APPROVED, REJECTED
    creator_id BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (creator_id) REFERENCES users(id) ON DELETE SET NULL
);

-- 4. Club Members table
CREATE TABLE IF NOT EXISTS club_members (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    club_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    role VARCHAR(30) DEFAULT 'MEMBER', -- MEMBER, VICE_PRESIDENT, PRESIDENT
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_membership (club_id, user_id),
    FOREIGN KEY (club_id) REFERENCES clubs(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 5. Join Requests table
CREATE TABLE IF NOT EXISTS join_requests (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    club_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    status VARCHAR(20) DEFAULT 'PENDING', -- PENDING, APPROVED, REJECTED
    request_message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_request (club_id, user_id, status),
    FOREIGN KEY (club_id) REFERENCES clubs(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 6. Events table
CREATE TABLE IF NOT EXISTS events (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    club_id BIGINT NOT NULL,
    title VARCHAR(150) NOT NULL,
    description TEXT,
    banner_url VARCHAR(255),
    event_date DATE NOT NULL,
    event_time TIME NOT NULL,
    location VARCHAR(150) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (club_id) REFERENCES clubs(id) ON DELETE CASCADE
);

-- 7. Event Registrations table
CREATE TABLE IF NOT EXISTS event_registrations (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    event_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) DEFAULT 'REGISTERED', -- REGISTERED, CANCELLED
    attended BOOLEAN DEFAULT FALSE,
    UNIQUE KEY unique_registration (event_id, user_id),
    FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 8. Certificates table
CREATE TABLE IF NOT EXISTS certificates (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    event_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    certificate_code VARCHAR(100) NOT NULL UNIQUE,
    issued_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    download_url VARCHAR(255) NOT NULL,
    FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 9. Notifications table
CREATE TABLE IF NOT EXISTS notifications (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 10. Announcements table
CREATE TABLE IF NOT EXISTS announcements (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    club_id BIGINT, -- If null, this is a system-wide announcement by admin
    title VARCHAR(150) NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (club_id) REFERENCES clubs(id) ON DELETE CASCADE
);

-- 11. Activity Logs table
CREATE TABLE IF NOT EXISTS activity_logs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT,
    action VARCHAR(255) NOT NULL,
    ip_address VARCHAR(45),
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- ==========================================
-- SEED DATA
-- ==========================================

-- Seed Roles
INSERT INTO roles (id, name) VALUES (1, 'ROLE_ADMIN');
INSERT INTO roles (id, name) VALUES (2, 'ROLE_CLUB_MANAGER');
INSERT INTO roles (id, name) VALUES (3, 'ROLE_STUDENT');

-- Seed Users (Passwords are crypted/hashed, default is 'password123')
-- Admin User
INSERT INTO users (id, username, password, email, first_name, last_name, role_id, profile_picture_url)
VALUES (1, 'admin', '$2a$10$Y50VwF95eNoK8Z0oIob.a.37uI28Y.4vFj76R.3M6Eby9.Vp5vC9a', 'admin@clubsphere.com', 'System', 'Administrator', 1, 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=120');

-- Club Managers
INSERT INTO users (id, username, password, email, first_name, last_name, role_id, profile_picture_url)
VALUES (2, 'manager_john', '$2a$10$Y50VwF95eNoK8Z0oIob.a.37uI28Y.4vFj76R.3M6Eby9.Vp5vC9a', 'john.manager@clubsphere.com', 'John', 'Doe', 2, 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&q=80&w=120');

INSERT INTO users (id, username, password, email, first_name, last_name, role_id, profile_picture_url)
VALUES (3, 'manager_alice', '$2a$10$Y50VwF95eNoK8Z0oIob.a.37uI28Y.4vFj76R.3M6Eby9.Vp5vC9a', 'alice.manager@clubsphere.com', 'Alice', 'Smith', 2, 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=120');

-- Students
INSERT INTO users (id, username, password, email, first_name, last_name, role_id, profile_picture_url)
VALUES (4, 'student_bob', '$2a$10$Y50VwF95eNoK8Z0oIob.a.37uI28Y.4vFj76R.3M6Eby9.Vp5vC9a', 'bob.student@clubsphere.com', 'Bob', 'Johnson', 3, 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=120');

INSERT INTO users (id, username, password, email, first_name, last_name, role_id, profile_picture_url)
VALUES (5, 'student_clara', '$2a$10$Y50VwF95eNoK8Z0oIob.a.37uI28Y.4vFj76R.3M6Eby9.Vp5vC9a', 'clara.student@clubsphere.com', 'Clara', 'Davis', 3, 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=120');

-- Seed Clubs
INSERT INTO clubs (id, name, description, category, banner_url, status, creator_id)
VALUES (1, 'Coding & Algo Wizards', 'The ultimate hub for competitive programming, web development workshops, and hackathons.', 'Technology', 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&q=80&w=400', 'APPROVED', 2);

INSERT INTO clubs (id, name, description, category, banner_url, status, creator_id)
VALUES (2, 'E-Cell Entrepreneurship', 'Empowering next-gen innovators and startup builders with mentoring, pitching, and funding connections.', 'Business', 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?auto=format&fit=crop&q=80&w=400', 'APPROVED', 3);

INSERT INTO clubs (id, name, description, category, banner_url, status, creator_id)
VALUES (3, 'Rhythm & Beats Music', 'For all music lovers! From classical symphonies to heavy rock, we jam, learn, and perform live.', 'Arts & Culture', 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&q=80&w=400', 'PENDING', 2);

-- Seed Club Members
INSERT INTO club_members (id, club_id, user_id, role) VALUES (1, 1, 2, 'PRESIDENT');
INSERT INTO club_members (id, club_id, user_id, role) VALUES (2, 2, 3, 'PRESIDENT');
INSERT INTO club_members (id, club_id, user_id, role) VALUES (3, 1, 4, 'MEMBER');
INSERT INTO club_members (id, club_id, user_id, role) VALUES (4, 2, 5, 'MEMBER');

-- Seed Events
INSERT INTO events (id, club_id, title, description, banner_url, event_date, event_time, location)
VALUES (1, 1, 'HackSphere 2026', 'A 24-hour fast-paced hackathon on building sustainable solutions for modern student campuses.', 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&q=80&w=400', '2026-08-15', '09:00:00', 'Main Campus Auditorium');

INSERT INTO events (id, club_id, title, description, banner_url, event_date, event_time, location)
VALUES (2, 2, 'Startup Pitch Night', 'Present your disruptive startup ideas to local VCs and angel investors for a chance to win seed money.', 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?auto=format&fit=crop&q=80&w=400', '2026-08-22', '18:00:00', 'Seminar Hall B');

-- Seed Event Registrations
INSERT INTO event_registrations (id, event_id, user_id, status, attended) VALUES (1, 1, 4, 'REGISTERED', TRUE);
INSERT INTO event_registrations (id, event_id, user_id, status, attended) VALUES (2, 1, 5, 'REGISTERED', FALSE);
INSERT INTO event_registrations (id, event_id, user_id, status, attended) VALUES (3, 2, 5, 'REGISTERED', TRUE);

-- Seed Certificates
INSERT INTO certificates (id, event_id, user_id, certificate_code, download_url)
VALUES (1, 1, 4, 'CERT-HACK-2026-004', '/api/certificates/download/CERT-HACK-2026-004');
INSERT INTO certificates (id, event_id, user_id, certificate_code, download_url)
VALUES (2, 2, 5, 'CERT-PITCH-2026-005', '/api/certificates/download/CERT-PITCH-2026-005');

-- Seed Announcements
INSERT INTO announcements (id, club_id, title, content)
VALUES (1, NULL, 'Welcome to ClubSphere!', 'Explore amazing college student clubs, register for exciting events, and collaborate seamlessly!');

INSERT INTO announcements (id, club_id, title, content)
VALUES (2, 1, 'Algorithm Prep Sessions', 'HackSphere prep sessions begin this Friday in Lab 4. Bring your laptops with Docker installed.');

-- Seed Notifications
INSERT INTO notifications (id, user_id, message, is_read)
VALUES (1, 4, 'Welcome to the Coding & Algo Wizards club! Feel free to checkout upcoming events.', FALSE);
INSERT INTO notifications (id, user_id, message, is_read)
VALUES (2, 5, 'Your registration for Startup Pitch Night is confirmed.', FALSE);
