import express, { Request, Response, NextFunction } from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import open from "open";
import axios from "axios";

// Senior Architect Production-Ready Full Stack Simulation Engine
// This Express server serves the React Vite UI and provides standard high-fidelity Spring Boot REST APIs
// backed by a persistent-like in-memory data store with complete seed data.

const app = express();
const PORT = 3000;

// Body Parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Spring Boot API Proxy Middleware
const proxiedPaths = ['/auth', '/clubs', '/events', '/memberships', '/users', '/announcements', '/dashboard', '/logs', '/certificates', '/notifications', '/admin'];
app.use('/api', async (req, res, next) => {
  const isProxied = proxiedPaths.some(path => req.path.startsWith(path));
  
  if (!isProxied) {
    next();
    return;
  }
  
  const backendUrl = `http://localhost:8080/api${req.url}`;
  try {
    const response = await axios({
      method: req.method,
      url: backendUrl,
      headers: {
        ...req.headers,
        host: 'localhost:8080'
      },
      data: req.body,
      responseType: 'stream',
      validateStatus: () => true
    });
    
    res.status(response.status);
    Object.entries(response.headers).forEach(([key, value]) => {
      res.setHeader(key, value as string);
    });
    
    response.data.pipe(res);
  } catch (error: any) {
    if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
      console.warn(`[ClubSphere Proxy] Backend unreachable at port 8080. Falling back to local simulation engine for path: ${req.path}`);
      next();
    } else {
      console.error("Backend proxy error for path " + req.path + ":", error.message);
      res.status(500).json({ error: "Failed to connect to Spring Boot backend service. Make sure it is running on port 8080." });
    }
  }
});

// IN-MEMORY DATA STORE (Mirror of MySQL Tables)
let roles = [
  { id: 1, name: "ROLE_ADMIN" },
  { id: 2, name: "ROLE_CLUB_MANAGER" },
  { id: 3, name: "ROLE_STUDENT" }
];

let users = [
  {
    id: 1,
    username: "admin",
    password: "password123", // Simplified for ease of login in prototype
    email: "admin@clubsphere.com",
    firstName: "System",
    lastName: "Administrator",
    roleId: 1,
    profilePictureUrl: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=120"
  },
  {
    id: 2,
    username: "manager_john",
    password: "password123",
    email: "john.manager@clubsphere.com",
    firstName: "John",
    lastName: "Doe",
    roleId: 2,
    profilePictureUrl: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&q=80&w=120"
  },
  {
    id: 3,
    username: "manager_alice",
    password: "password123",
    email: "alice.manager@clubsphere.com",
    firstName: "Alice",
    lastName: "Smith",
    roleId: 2,
    profilePictureUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=120"
  },
  {
    id: 4,
    username: "student_bob",
    password: "password123",
    email: "bob.student@clubsphere.com",
    firstName: "Bob",
    lastName: "Johnson",
    roleId: 3,
    profilePictureUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=120"
  },
  {
    id: 5,
    username: "student_clara",
    password: "password123",
    email: "clara.student@clubsphere.com",
    firstName: "Clara",
    lastName: "Davis",
    roleId: 3,
    profilePictureUrl: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=120"
  }
];

let clubs = [
  {
    id: 1,
    name: "Coding & Algo Wizards",
    description: "The ultimate hub for competitive programming, web development workshops, and hackathons.",
    category: "Technology",
    bannerUrl: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&q=80&w=400",
    status: "APPROVED",
    creatorId: 2,
    createdAt: new Date().toISOString()
  },
  {
    id: 2,
    name: "E-Cell Entrepreneurship",
    description: "Empowering next-gen innovators and startup builders with mentoring, pitching, and funding connections.",
    category: "Business",
    bannerUrl: "https://images.unsplash.com/photo-1515187029135-18ee286d815b?auto=format&fit=crop&q=80&w=400",
    status: "APPROVED",
    creatorId: 3,
    createdAt: new Date().toISOString()
  },
  {
    id: 3,
    name: "Rhythm & Beats Music",
    description: "For all music lovers! From classical symphonies to heavy rock, we jam, learn, and perform live.",
    category: "Arts & Culture",
    bannerUrl: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&q=80&w=400",
    status: "PENDING",
    creatorId: 2,
    createdAt: new Date().toISOString()
  }
];

let clubMembers = [
  { id: 1, clubId: 1, userId: 2, role: "PRESIDENT", joinedAt: new Date().toISOString() },
  { id: 2, clubId: 2, userId: 3, role: "PRESIDENT", joinedAt: new Date().toISOString() },
  { id: 3, clubId: 1, userId: 4, role: "MEMBER", joinedAt: new Date().toISOString() },
  { id: 4, clubId: 2, userId: 5, role: "MEMBER", joinedAt: new Date().toISOString() }
];

let joinRequests = [
  { id: 1, clubId: 2, userId: 4, status: "PENDING", requestMessage: "Hi, I am interested in joining the E-Cell to start a micro-SaaS!", createdAt: new Date().toISOString() }
];

let events = [
  {
    id: 1,
    clubId: 1,
    title: "HackSphere 2026",
    description: "A 24-hour fast-paced hackathon on building sustainable solutions for modern student campuses.",
    bannerUrl: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&q=80&w=400",
    eventDate: "2026-08-15",
    eventTime: "09:00:00",
    location: "Main Campus Auditorium",
    createdAt: new Date().toISOString()
  },
  {
    id: 2,
    clubId: 2,
    title: "Startup Pitch Night",
    description: "Present your disruptive startup ideas to local VCs and angel investors for a chance to win seed money.",
    bannerUrl: "https://images.unsplash.com/photo-1515187029135-18ee286d815b?auto=format&fit=crop&q=80&w=400",
    eventDate: "2026-08-22",
    eventTime: "18:00:00",
    location: "Seminar Hall B",
    createdAt: new Date().toISOString()
  }
];

let eventRegistrations = [
  { id: 1, eventId: 1, userId: 4, status: "REGISTERED", attended: true, registeredAt: new Date().toISOString() },
  { id: 2, eventId: 1, userId: 5, status: "REGISTERED", attended: false, registeredAt: new Date().toISOString() },
  { id: 3, eventId: 2, userId: 5, status: "REGISTERED", attended: true, registeredAt: new Date().toISOString() }
];

let certificates = [
  { id: 1, eventId: 1, userId: 4, certificateCode: "CERT-HACK-2026-004", issuedAt: new Date().toISOString(), downloadUrl: "/api/certificates/download/CERT-HACK-2026-004" },
  { id: 2, eventId: 2, userId: 5, certificateCode: "CERT-PITCH-2026-005", issuedAt: new Date().toISOString(), downloadUrl: "/api/certificates/download/CERT-PITCH-2026-005" }
];

let notifications = [
  { id: 1, userId: 4, message: "Welcome to the Coding & Algo Wizards club! Feel free to checkout upcoming events.", isRead: false, createdAt: new Date().toISOString() },
  { id: 2, userId: 5, message: "Your registration for Startup Pitch Night is confirmed.", isRead: false, createdAt: new Date().toISOString() }
];

let announcements = [
  { id: 1, clubId: null, title: "Welcome to ClubSphere!", content: "Explore amazing college student clubs, register for exciting events, and collaborate seamlessly!", createdAt: new Date().toISOString() },
  { id: 2, clubId: 1, title: "Algorithm Prep Sessions", content: "HackSphere prep sessions begin this Friday in Lab 4. Bring your laptops with Docker installed.", createdAt: new Date().toISOString() }
];

let activityLogs = [
  { id: 1, userId: 1, action: "System initialized", ipAddress: "127.0.0.1", timestamp: new Date().toISOString() }
];

// Helper to log actions
function logActivity(userId: number | null, action: string, req: Request) {
  const ip = req.ip || "unknown";
  activityLogs.unshift({
    id: activityLogs.length + 1,
    userId,
    action,
    ipAddress: ip,
    timestamp: new Date().toISOString()
  });
}

// ----------------------------------------------------
// REST APIs (Mirror of Spring Boot REST controllers)
// ----------------------------------------------------

// Security/Auth Middleware (simulating JWT verification)
function authenticateJWT(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.substring(7);
    try {
      // Decode simulated token (e.g., base64 encoded user JSON)
      const decodedStr = Buffer.from(token, "base64").toString("utf-8");
      const userObj = JSON.parse(decodedStr);
      const user = users.find(u => u.id === userObj.id);
      if (user) {
        (req as any).user = user;
        next();
        return;
      }
    } catch (err) {
      // Token parsing error
    }
  }
  res.status(401).json({ message: "Unauthorized. Missing or invalid Bearer JWT Token." });
}

// Global Logging Middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// AUTH CONTROLLER ENDPOINTS
app.post("/api/auth/login", (req, res) => {
  const { username, password } = req.body;
  const user = users.find(u => u.username === username && u.password === password);
  if (user) {
    const roleName = roles.find(r => r.id === user.roleId)?.name || "ROLE_STUDENT";
    // Construct simulated token (base64 encoded JSON)
    const payload = { id: user.id, username: user.username, role: roleName };
    const token = Buffer.from(JSON.stringify(payload)).toString("base64");
    
    logActivity(user.id, `User logged in successfully: ${username}`, req);

    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: roleName,
        profilePictureUrl: user.profilePictureUrl
      }
    });
  } else {
    res.status(401).json({ message: "Invalid username or password" });
  }
});

app.post("/api/auth/register", (req, res) => {
  const { username, password, email, firstName, lastName, role } = req.body;
  if (!username || !password || !email || !firstName || !lastName) {
    res.status(400).json({ message: "All fields are required" });
    return;
  }
  if (users.some(u => u.username === username)) {
    res.status(400).json({ message: "Username already taken" });
    return;
  }
  if (users.some(u => u.email === email)) {
    res.status(400).json({ message: "Email already exists" });
    return;
  }

  const resolvedRole = role || "ROLE_STUDENT";
  const roleObj = roles.find(r => r.name === resolvedRole) || roles[2]; // Fallback to student
  const newUser = {
    id: users.length + 1,
    username,
    password,
    email,
    firstName,
    lastName,
    roleId: roleObj.id,
    profilePictureUrl: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=120" // Placeholder
  };
  users.push(newUser);
  logActivity(newUser.id, `New user registered: ${username}`, req);

  // Add welcome notification
  notifications.unshift({
    id: notifications.length + 1,
    userId: newUser.id,
    message: `Welcome to ClubSphere, ${firstName}! Browse and join clubs to start collaborating.`,
    isRead: false,
    createdAt: new Date().toISOString()
  });

  res.status(201).json({ message: "User registered successfully" });
});

// Profile endpoints
app.get("/api/users/profile", authenticateJWT, (req: any, res) => {
  const user = req.user;
  const roleName = roles.find(r => r.id === user.roleId)?.name || "ROLE_STUDENT";
  res.json({
    id: user.id,
    username: user.username,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    role: roleName,
    profilePictureUrl: user.profilePictureUrl
  });
});

app.put("/api/users/profile", authenticateJWT, (req: any, res) => {
  const user = req.user;
  const { firstName, lastName, email, profilePictureUrl } = req.body;
  const targetUser = users.find(u => u.id === user.id);
  if (targetUser) {
    if (firstName) targetUser.firstName = firstName;
    if (lastName) targetUser.lastName = lastName;
    if (email) targetUser.email = email;
    if (profilePictureUrl) targetUser.profilePictureUrl = profilePictureUrl;
    logActivity(targetUser.id, `Updated user profile details`, req);
    res.json(targetUser);
  } else {
    res.status(404).json({ message: "User not found" });
  }
});

// CLUBS CONTROLLER
app.get("/api/clubs", (req, res) => {
  // Supports filtering by category/status
  const { category, status } = req.query;
  let filtered = clubs;
  if (category) {
    filtered = filtered.filter(c => c.category.toLowerCase() === (category as string).toLowerCase());
  }
  if (status) {
    filtered = filtered.filter(c => c.status === status);
  }
  res.json(filtered);
});

app.get("/api/clubs/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const club = clubs.find(c => c.id === id);
  if (club) {
    const creator = users.find(u => u.id === club.creatorId);
    const membersCount = clubMembers.filter(m => m.clubId === id).length;
    res.json({
      ...club,
      creatorName: creator ? `${creator.firstName} ${creator.lastName}` : "Unknown",
      membersCount
    });
  } else {
    res.status(404).json({ message: "Club not found" });
  }
});

app.post("/api/clubs", authenticateJWT, (req: any, res) => {
  const { name, description, category, bannerUrl } = req.body;
  const user = req.user;

  // Club Managers can request, Admin gets auto-approved, Students cannot create
  const userRole = roles.find(r => r.id === user.roleId)?.name;
  if (userRole === "ROLE_STUDENT") {
    res.status(403).json({ message: "Access Denied. Only Club Managers or Admins can create clubs." });
    return;
  }

  const newClub = {
    id: clubs.length + 1,
    name,
    description,
    category,
    bannerUrl: bannerUrl || "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&q=80&w=400",
    status: userRole === "ROLE_ADMIN" ? "APPROVED" : "PENDING",
    creatorId: user.id,
    createdAt: new Date().toISOString()
  };
  clubs.push(newClub);

  // Add the creator as PRESIDENT of the club if approved
  if (newClub.status === "APPROVED") {
    clubMembers.push({
      id: clubMembers.length + 1,
      clubId: newClub.id,
      userId: user.id,
      role: "PRESIDENT",
      joinedAt: new Date().toISOString()
    });
  }

  logActivity(user.id, `Created club request: ${name} (${newClub.status})`, req);
  res.status(201).json(newClub);
});

app.put("/api/clubs/:id", authenticateJWT, (req: any, res) => {
  const id = parseInt(req.params.id);
  const { name, description, category, bannerUrl, status } = req.body;
  const user = req.user;

  const club = clubs.find(c => c.id === id);
  if (!club) {
    res.status(404).json({ message: "Club not found" });
    return;
  }

  // Auth: Creator or Admin
  const userRole = roles.find(r => r.id === user.roleId)?.name;
  if (club.creatorId !== user.id && userRole !== "ROLE_ADMIN") {
    res.status(403).json({ message: "Access Denied. You do not own this club." });
    return;
  }

  if (name) club.name = name;
  if (description) club.description = description;
  if (category) club.category = category;
  if (bannerUrl) club.bannerUrl = bannerUrl;
  if (status && userRole === "ROLE_ADMIN") club.status = status; // Only admin can approve/reject

  logActivity(user.id, `Updated club details: ${club.name}`, req);
  res.json(club);
});

app.delete("/api/clubs/:id", authenticateJWT, (req: any, res) => {
  const id = parseInt(req.params.id);
  const user = req.user;
  const clubIndex = clubs.findIndex(c => c.id === id);

  if (clubIndex === -1) {
    res.status(404).json({ message: "Club not found" });
    return;
  }

  const club = clubs[clubIndex];
  const userRole = roles.find(r => r.id === user.roleId)?.name;
  if (club.creatorId !== user.id && userRole !== "ROLE_ADMIN") {
    res.status(403).json({ message: "Access Denied." });
    return;
  }

  clubs.splice(clubIndex, 1);
  // Cleanup memberships
  clubMembers = clubMembers.filter(m => m.clubId !== id);
  logActivity(user.id, `Deleted club: ${club.name}`, req);
  res.json({ message: "Club deleted successfully" });
});

// MEMBERS & JOIN REQUESTS CONTROLLER
app.get("/api/clubs/:id/members", (req, res) => {
  const clubId = parseInt(req.params.id);
  const memberships = clubMembers.filter(m => m.clubId === clubId);
  const result = memberships.map(m => {
    const user = users.find(u => u.id === m.userId);
    return {
      membershipId: m.id,
      userId: m.userId,
      role: m.role,
      joinedAt: m.joinedAt,
      username: user?.username,
      firstName: user?.firstName,
      lastName: user?.lastName,
      email: user?.email,
      profilePictureUrl: user?.profilePictureUrl
    };
  });
  res.json(result);
});

// Join Request Trigger
app.post("/api/clubs/:id/join", authenticateJWT, (req: any, res) => {
  const clubId = parseInt(req.params.id);
  const user = req.user;
  const { requestMessage } = req.body;

  const club = clubs.find(c => c.id === clubId);
  if (!club || club.status !== "APPROVED") {
    res.status(404).json({ message: "Approved Club not found" });
    return;
  }

  // Check if already a member
  if (clubMembers.some(m => m.clubId === clubId && m.userId === user.id)) {
    res.status(400).json({ message: "You are already a member of this club" });
    return;
  }

  // Check if active join request exists
  if (joinRequests.some(r => r.clubId === clubId && r.userId === user.id && r.status === "PENDING")) {
    res.status(400).json({ message: "Join request already submitted and is pending approval" });
    return;
  }

  const newRequest = {
    id: joinRequests.length + 1,
    clubId,
    userId: user.id,
    status: "PENDING",
    requestMessage: requestMessage || "I want to collaborate in this club!",
    createdAt: new Date().toISOString()
  };
  joinRequests.push(newRequest);

  // Send notification to club creator (Manager)
  notifications.unshift({
    id: notifications.length + 1,
    userId: club.creatorId,
    message: `New join request from ${user.firstName} ${user.lastName} for ${club.name}`,
    isRead: false,
    createdAt: new Date().toISOString()
  });

  logActivity(user.id, `Submitted join request for club: ${club.name}`, req);
  res.status(201).json(newRequest);
});

// Get Join Requests for Club
app.get("/api/clubs/:id/requests", authenticateJWT, (req: any, res) => {
  const clubId = parseInt(req.params.id);
  const user = req.user;

  const club = clubs.find(c => c.id === clubId);
  if (!club) {
    res.status(404).json({ message: "Club not found" });
    return;
  }

  const userRole = roles.find(r => r.id === user.roleId)?.name;
  if (club.creatorId !== user.id && userRole !== "ROLE_ADMIN") {
    res.status(403).json({ message: "Access Denied. Only Club Manager can view requests." });
    return;
  }

  const requests = joinRequests.filter(r => r.clubId === clubId);
  const result = requests.map(r => {
    const requestUser = users.find(u => u.id === r.userId);
    return {
      ...r,
      user: requestUser ? {
        id: requestUser.id,
        firstName: requestUser.firstName,
        lastName: requestUser.lastName,
        username: requestUser.username,
        email: requestUser.email,
        profilePictureUrl: requestUser.profilePictureUrl
      } : null
    };
  });
  res.json(result);
});

// Approve/Reject Request
app.put("/api/clubs/requests/:requestId", authenticateJWT, (req: any, res) => {
  const requestId = parseInt(req.params.requestId);
  const { status } = req.body; // APPROVED or REJECTED
  const user = req.user;

  const request = joinRequests.find(r => r.id === requestId);
  if (!request) {
    res.status(404).json({ message: "Request not found" });
    return;
  }

  const club = clubs.find(c => c.id === request.clubId);
  if (!club) {
    res.status(404).json({ message: "Associated club not found" });
    return;
  }

  const userRole = roles.find(r => r.id === user.roleId)?.name;
  if (club.creatorId !== user.id && userRole !== "ROLE_ADMIN") {
    res.status(403).json({ message: "Access Denied." });
    return;
  }

  request.status = status;
  logActivity(user.id, `Responded to club request id ${requestId}: ${status}`, req);

  if (status === "APPROVED") {
    clubMembers.push({
      id: clubMembers.length + 1,
      clubId: request.clubId,
      userId: request.userId,
      role: "MEMBER",
      joinedAt: new Date().toISOString()
    });

    notifications.unshift({
      id: notifications.length + 1,
      userId: request.userId,
      message: `Congratulations! Your join request for ${club.name} was APPROVED.`,
      isRead: false,
      createdAt: new Date().toISOString()
    });
  } else {
    notifications.unshift({
      id: notifications.length + 1,
      userId: request.userId,
      message: `Your join request for ${club.name} was declined.`,
      isRead: false,
      createdAt: new Date().toISOString()
    });
  }

  res.json(request);
});

// Leave Club API
app.post("/api/clubs/:id/leave", authenticateJWT, (req: any, res) => {
  const clubId = parseInt(req.params.id);
  const user = req.user;

  const membershipIndex = clubMembers.findIndex(m => m.clubId === clubId && m.userId === user.id);
  if (membershipIndex === -1) {
    res.status(400).json({ message: "You are not a member of this club" });
    return;
  }

  const membership = clubMembers[membershipIndex];
  if (membership.role === "PRESIDENT") {
    res.status(400).json({ message: "The Club President cannot leave the club without transferring leadership." });
    return;
  }

  clubMembers.splice(membershipIndex, 1);
  logActivity(user.id, `Left club: ID ${clubId}`, req);
  res.json({ message: "Left club successfully" });
});

// EVENTS CONTROLLER
app.get("/api/events", (req, res) => {
  const { clubId } = req.query;
  let filtered = events;
  if (clubId) {
    filtered = filtered.filter(e => e.clubId === parseInt(clubId as string));
  }
  const result = filtered.map(e => {
    const club = clubs.find(c => c.id === e.clubId);
    return {
      ...e,
      clubName: club ? club.name : "System"
    };
  });
  res.json(result);
});

app.get("/api/events/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const event = events.find(e => e.id === id);
  if (event) {
    const club = clubs.find(c => c.id === event.clubId);
    const registrationsCount = eventRegistrations.filter(r => r.eventId === id && r.status === "REGISTERED").length;
    res.json({
      ...event,
      clubName: club ? club.name : "System",
      registrationsCount
    });
  } else {
    res.status(404).json({ message: "Event not found" });
  }
});

app.post("/api/events", authenticateJWT, (req: any, res) => {
  const { clubId, title, description, bannerUrl, eventDate, eventTime, location } = req.body;
  const user = req.user;

  const club = clubs.find(c => c.id === parseInt(clubId));
  if (!club) {
    res.status(404).json({ message: "Club not found" });
    return;
  }

  const userRole = roles.find(r => r.id === user.roleId)?.name;
  if (club.creatorId !== user.id && userRole !== "ROLE_ADMIN") {
    res.status(403).json({ message: "Access Denied. You don't own this club." });
    return;
  }

  const newEvent = {
    id: events.length + 1,
    clubId: parseInt(clubId),
    title,
    description,
    bannerUrl: bannerUrl || "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&q=80&w=400",
    eventDate,
    eventTime,
    location,
    createdAt: new Date().toISOString()
  };
  events.push(newEvent);

  // Notify all club members about the event
  const memberships = clubMembers.filter(m => m.clubId === club.id);
  memberships.forEach(m => {
    notifications.unshift({
      id: notifications.length + 1,
      userId: m.userId,
      message: `New event! ${title} has been scheduled by ${club.name} on ${eventDate}. Register now!`,
      isRead: false,
      createdAt: new Date().toISOString()
    });
  });

  logActivity(user.id, `Scheduled new event: ${title}`, req);
  res.status(201).json(newEvent);
});

app.put("/api/events/:id", authenticateJWT, (req: any, res) => {
  const id = parseInt(req.params.id);
  const { title, description, bannerUrl, eventDate, eventTime, location } = req.body;
  const user = req.user;

  const event = events.find(e => e.id === id);
  if (!event) {
    res.status(404).json({ message: "Event not found" });
    return;
  }

  const club = clubs.find(c => c.id === event.clubId);
  const userRole = roles.find(r => r.id === user.roleId)?.name;
  if ((!club || club.creatorId !== user.id) && userRole !== "ROLE_ADMIN") {
    res.status(403).json({ message: "Access Denied." });
    return;
  }

  if (title) event.title = title;
  if (description) event.description = description;
  if (bannerUrl) event.bannerUrl = bannerUrl;
  if (eventDate) event.eventDate = eventDate;
  if (eventTime) event.eventTime = eventTime;
  if (location) event.location = location;

  logActivity(user.id, `Updated event details: ${event.title}`, req);
  res.json(event);
});

app.delete("/api/events/:id", authenticateJWT, (req: any, res) => {
  const id = parseInt(req.params.id);
  const user = req.user;

  const eventIndex = events.findIndex(e => e.id === id);
  if (eventIndex === -1) {
    res.status(404).json({ message: "Event not found" });
    return;
  }

  const event = events[eventIndex];
  const club = clubs.find(c => c.id === event.clubId);
  const userRole = roles.find(r => r.id === user.roleId)?.name;
  if ((!club || club.creatorId !== user.id) && userRole !== "ROLE_ADMIN") {
    res.status(403).json({ message: "Access Denied." });
    return;
  }

  events.splice(eventIndex, 1);
  // Cleanup registrations
  eventRegistrations = eventRegistrations.filter(r => r.eventId !== id);
  logActivity(user.id, `Deleted event: ${event.title}`, req);
  res.json({ message: "Event deleted successfully" });
});

// EVENT REGISTRATIONS CONTROLLER
app.post("/api/events/:id/register", authenticateJWT, (req: any, res) => {
  const eventId = parseInt(req.params.id);
  const user = req.user;

  const event = events.find(e => e.id === eventId);
  if (!event) {
    res.status(404).json({ message: "Event not found" });
    return;
  }

  const existingReg = eventRegistrations.find(r => r.eventId === eventId && r.userId === user.id);
  if (existingReg) {
    if (existingReg.status === "REGISTERED") {
      res.status(400).json({ message: "You are already registered for this event" });
      return;
    } else {
      existingReg.status = "REGISTERED";
      logActivity(user.id, `Re-registered for event: ${event.title}`, req);
      res.json(existingReg);
      return;
    }
  }

  const newReg = {
    id: eventRegistrations.length + 1,
    eventId,
    userId: user.id,
    status: "REGISTERED",
    attended: false,
    registeredAt: new Date().toISOString()
  };
  eventRegistrations.push(newReg);

  logActivity(user.id, `Registered for event: ${event.title}`, req);
  res.status(201).json(newReg);
});

app.post("/api/events/:id/cancel", authenticateJWT, (req: any, res) => {
  const eventId = parseInt(req.params.id);
  const user = req.user;

  const reg = eventRegistrations.find(r => r.eventId === eventId && r.userId === user.id && r.status === "REGISTERED");
  if (!reg) {
    res.status(400).json({ message: "Active registration not found" });
    return;
  }

  reg.status = "CANCELLED";
  logActivity(user.id, `Cancelled event registration: ID ${eventId}`, req);
  res.json({ message: "Registration cancelled successfully" });
});

// Attendance and certificate generation
app.get("/api/events/:id/registrations", authenticateJWT, (req: any, res) => {
  const eventId = parseInt(req.params.id);
  const user = req.user;

  const event = events.find(e => e.id === eventId);
  if (!event) {
    res.status(404).json({ message: "Event not found" });
    return;
  }

  const club = clubs.find(c => c.id === event.clubId);
  const userRole = roles.find(r => r.id === user.roleId)?.name;
  if ((!club || club.creatorId !== user.id) && userRole !== "ROLE_ADMIN") {
    res.status(403).json({ message: "Access Denied." });
    return;
  }

  const regs = eventRegistrations.filter(r => r.eventId === eventId);
  const result = regs.map(r => {
    const regUser = users.find(u => u.id === r.userId);
    return {
      ...r,
      user: regUser ? {
        id: regUser.id,
        firstName: regUser.firstName,
        lastName: regUser.lastName,
        email: regUser.email,
        username: regUser.username
      } : null
    };
  });
  res.json(result);
});

app.post("/api/events/:id/attendance", authenticateJWT, (req: any, res) => {
  const eventId = parseInt(req.params.id);
  const { userId, attended } = req.body; // boolean
  const user = req.user;

  const event = events.find(e => e.id === eventId);
  if (!event) {
    res.status(404).json({ message: "Event not found" });
    return;
  }

  const club = clubs.find(c => c.id === event.clubId);
  const userRole = roles.find(r => r.id === user.roleId)?.name;
  if ((!club || club.creatorId !== user.id) && userRole !== "ROLE_ADMIN") {
    res.status(403).json({ message: "Access Denied." });
    return;
  }

  const reg = eventRegistrations.find(r => r.eventId === eventId && r.userId === parseInt(userId));
  if (!reg) {
    res.status(404).json({ message: "Registration not found" });
    return;
  }

  reg.attended = attended;
  logActivity(user.id, `Marked user ${userId} attendance for ${event.title}: ${attended}`, req);
  res.json(reg);
});

// CERTIFICATES CONTROLLER
app.get("/api/certificates", authenticateJWT, (req: any, res) => {
  const user = req.user;
  // If student, view their certificates. If admin/manager, view all.
  const userRole = roles.find(r => r.id === user.roleId)?.name;
  let filtered = certificates;
  if (userRole === "ROLE_STUDENT") {
    filtered = certificates.filter(c => c.userId === user.id);
  }
  const result = filtered.map(c => {
    const event = events.find(e => e.id === c.eventId);
    const student = users.find(u => u.id === c.userId);
    return {
      ...c,
      eventTitle: event ? event.title : "Unknown Event",
      eventDate: event ? event.eventDate : "",
      studentName: student ? `${student.firstName} ${student.lastName}` : "Unknown Student"
    };
  });
  res.json(result);
});

app.post("/api/events/:id/generate-certificates", authenticateJWT, (req: any, res) => {
  const eventId = parseInt(req.params.id);
  const user = req.user;

  const event = events.find(e => e.id === eventId);
  if (!event) {
    res.status(404).json({ message: "Event not found" });
    return;
  }

  const club = clubs.find(c => c.id === event.clubId);
  const userRole = roles.find(r => r.id === user.roleId)?.name;
  if ((!club || club.creatorId !== user.id) && userRole !== "ROLE_ADMIN") {
    res.status(403).json({ message: "Access Denied." });
    return;
  }

  // Find all registered students who ATTENDED and don't already have certificates
  const attendees = eventRegistrations.filter(r => r.eventId === eventId && r.attended && r.status === "REGISTERED");
  let generatedCount = 0;

  attendees.forEach(att => {
    const exists = certificates.some(c => c.eventId === eventId && c.userId === att.userId);
    if (!exists) {
      const code = `CERT-${event.title.substring(0, 4).toUpperCase()}-2026-${100 + att.userId}`;
      certificates.push({
        id: certificates.length + 1,
        eventId,
        userId: att.userId,
        certificateCode: code,
        issuedAt: new Date().toISOString(),
        downloadUrl: `/api/certificates/download/${code}`
      });
      
      notifications.unshift({
        id: notifications.length + 1,
        userId: att.userId,
        message: `Congratulations! Your certificate for "${event.title}" has been generated. Code: ${code}. Download it now from your dashboard!`,
        isRead: false,
        createdAt: new Date().toISOString()
      });

      generatedCount++;
    }
  });

  logActivity(user.id, `Generated certificates for ${event.title}: count ${generatedCount}`, req);
  res.json({ message: `Successfully generated ${generatedCount} certificates.` });
});

// ANNOUNCEMENTS
app.get("/api/announcements", (req, res) => {
  const { clubId } = req.query;
  let filtered = announcements;
  if (clubId) {
    filtered = announcements.filter(a => a.clubId === parseInt(clubId as string) || a.clubId === null);
  }
  const result = filtered.map(a => {
    const club = clubs.find(c => c.id === a.clubId);
    return {
      ...a,
      clubName: club ? club.name : "System Announcement"
    };
  });
  res.json(result);
});

app.post("/api/announcements", authenticateJWT, (req: any, res) => {
  const { clubId, title, content } = req.body;
  const user = req.user;

  // Admin can do system announcement (clubId = null). Club manager can do club announcement.
  const userRole = roles.find(r => r.id === user.roleId)?.name;
  if (!clubId) {
    // System-wide
    if (userRole !== "ROLE_ADMIN") {
      res.status(403).json({ message: "Only Admin can post system announcements." });
      return;
    }
  } else {
    const club = clubs.find(c => c.id === parseInt(clubId));
    if (!club || (club.creatorId !== user.id && userRole !== "ROLE_ADMIN")) {
      res.status(403).json({ message: "Access Denied." });
      return;
    }
  }

  const newAnn = {
    id: announcements.length + 1,
    clubId: clubId ? parseInt(clubId) : null,
    title,
    content,
    createdAt: new Date().toISOString()
  };
  announcements.push(newAnn);
  logActivity(user.id, `Created announcement: ${title}`, req);
  res.status(201).json(newAnn);
});

// NOTIFICATIONS
app.get("/api/notifications", authenticateJWT, (req: any, res) => {
  const user = req.user;
  const userNotifs = notifications.filter(n => n.userId === user.id);
  res.json(userNotifs);
});

app.put("/api/notifications/mark-read", authenticateJWT, (req: any, res) => {
  const user = req.user;
  notifications.forEach(n => {
    if (n.userId === user.id) {
      n.isRead = true;
    }
  });
  res.json({ message: "All notifications marked as read" });
});

// ADMIN API: USERS MANAGEMENT
app.get("/api/admin/users", authenticateJWT, (req: any, res) => {
  const user = req.user;
  const userRole = roles.find(r => r.id === user.roleId)?.name;
  if (userRole !== "ROLE_ADMIN") {
    res.status(403).json({ message: "Admin privileges required" });
    return;
  }
  
  const result = users.map(u => {
    const roleName = roles.find(r => r.id === u.roleId)?.name || "ROLE_STUDENT";
    return {
      ...u,
      role: roleName
    };
  });
  res.json(result);
});

app.put("/api/admin/users/:id/role", authenticateJWT, (req: any, res) => {
  const targetUserId = parseInt(req.params.id);
  const { roleName } = req.body; // e.g., ROLE_CLUB_MANAGER, ROLE_STUDENT
  const user = req.user;

  const userRole = roles.find(r => r.id === user.roleId)?.name;
  if (userRole !== "ROLE_ADMIN") {
    res.status(403).json({ message: "Admin privileges required" });
    return;
  }

  const targetUser = users.find(u => u.id === targetUserId);
  if (!targetUser) {
    res.status(404).json({ message: "User not found" });
    return;
  }

  const roleObj = roles.find(r => r.name === roleName);
  if (!roleObj) {
    res.status(400).json({ message: "Invalid role specified" });
    return;
  }

  targetUser.roleId = roleObj.id;
  logActivity(user.id, `Changed user ${targetUser.username} role to ${roleName}`, req);
  res.json({ message: "User role updated successfully" });
});

// ADMIN API: ACTIVITY LOGS
app.get("/api/admin/logs", authenticateJWT, (req: any, res) => {
  const user = req.user;
  const userRole = roles.find(r => r.id === user.roleId)?.name;
  if (userRole !== "ROLE_ADMIN") {
    res.status(403).json({ message: "Admin privileges required" });
    return;
  }
  
  const result = activityLogs.map(l => {
    const logUser = users.find(u => u.id === l.userId);
    return {
      ...l,
      username: logUser ? logUser.username : "System"
    };
  });
  res.json(result);
});

// STATS / DASHBOARD REPORTING ENDPOINT
app.get("/api/dashboard/stats", authenticateJWT, (req: any, res) => {
  const user = req.user;
  const userRole = roles.find(r => r.id === user.roleId)?.name;

  const totalClubs = clubs.filter(c => c.status === "APPROVED").length;
  const totalEvents = events.length;
  const totalStudents = users.filter(u => u.roleId === 3).length;
  const totalRegistrations = eventRegistrations.filter(r => r.status === "REGISTERED").length;

  // Chart data: Monthly events
  const monthlyEvents = [
    { name: "Jan", count: 2 },
    { name: "Feb", count: 4 },
    { name: "Mar", count: 3 },
    { name: "Apr", count: 6 },
    { name: "May", count: 8 },
    { name: "Jun", count: 5 },
    { name: "Jul", count: 9 },
    { name: "Aug", count: totalEvents + 2 } // Mocking a bit
  ];

  // Chart data: Club Growth
  const clubGrowth = [
    { name: "Jan", clubs: 1 },
    { name: "Mar", clubs: 2 },
    { name: "May", clubs: 2 },
    { name: "Jul", clubs: totalClubs }
  ];

  // Most active club (participations)
  const mostActiveClubs = clubs.map(c => {
    const clubEventIds = events.filter(e => e.clubId === c.id).map(e => e.id);
    const regCount = eventRegistrations.filter(r => clubEventIds.includes(r.eventId) && r.status === "REGISTERED").length;
    return { name: c.name, score: regCount };
  });

  // Participation stats
  const participationStats = [
    { name: "Coding", value: 40 },
    { name: "Business", value: 30 },
    { name: "Arts", value: 15 },
    { name: "Sports", value: 15 }
  ];

  res.json({
    totalClubs,
    totalEvents,
    totalStudents,
    totalRegistrations,
    monthlyEvents,
    clubGrowth,
    mostActiveClubs,
    participationStats
  });
});

// CERTIFICATE DOWNLOAD (Simulated)
app.get("/api/certificates/download/:code", (req, res) => {
  const { code } = req.params;
  const cert = certificates.find(c => c.certificateCode === code);
  if (!cert) {
    res.status(404).send("Certificate not found");
    return;
  }
  
  const event = events.find(e => e.id === cert.eventId);
  const student = users.find(u => u.id === cert.userId);
  
  res.setHeader("Content-Type", "text/html");
  res.send(`
    <html>
      <head>
        <title>Certificate - ${code}</title>
        <style>
          body { font-family: 'Georgia', serif; background-color: #f3f4f6; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; }
          .certificate { width: 800px; height: 550px; background-color: #fff; border: 20px solid #1e3a8a; padding: 40px; box-sizing: border-box; text-align: center; box-shadow: 0 10px 25px rgba(0,0,0,0.1); position: relative; }
          .certificate::after { content: ''; position: absolute; top: 10px; bottom: 10px; left: 10px; right: 10px; border: 2px solid #b45309; pointer-events: none; }
          h1 { color: #1e3a8a; font-size: 42px; margin-top: 20px; font-weight: normal; }
          h2 { color: #b45309; font-size: 20px; text-transform: uppercase; letter-spacing: 2px; }
          .name { font-size: 32px; font-weight: bold; margin: 20px 0; border-bottom: 2px solid #e5e7eb; display: inline-block; padding-bottom: 5px; min-width: 300px; }
          .text { font-size: 18px; line-height: 1.6; color: #4b5563; max-width: 600px; margin: 0 auto; }
          .footer-section { display: flex; justify-content: space-between; margin-top: 50px; padding: 0 50px; }
          .signature-box { border-top: 1px solid #9ca3af; width: 200px; padding-top: 5px; font-size: 14px; color: #4b5563; }
          .code { font-family: monospace; font-size: 12px; color: #9ca3af; margin-top: 30px; }
        </style>
      </head>
      <body>
        <div class="certificate">
          <h2>Certificate of Excellence</h2>
          <h1>ClubSphere Collaborator Award</h1>
          <p class="text">This is proudly presented to</p>
          <div class="name">${student ? `${student.firstName} ${student.lastName}` : "Valued Student"}</div>
          <p class="text">for actively participating and completing the campus event: <br><strong>"${event ? event.title : "Campus Workshop"}"</strong><br>organized with distinction by the student club community.</p>
          <div class="footer-section">
            <div class="signature-box">Club President Signature</div>
            <div class="signature-box">Staff Advisor Signature</div>
          </div>
          <div class="code">Verification Code: ${code} | Issued: ${new Date(cert.issuedAt).toLocaleDateString()}</div>
        </div>
      </body>
    </html>
  `);
});

// Image Upload Simulation Endpoint
app.post("/api/upload", authenticateJWT, (req, res) => {
  // Return a mock success and a high quality placeholder image URL
  const mockUrls = [
    "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&q=80&w=400",
    "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=400",
    "https://images.unsplash.com/photo-1523580494863-6f30312245d5?auto=format&fit=crop&q=80&w=400"
  ];
  const url = mockUrls[Math.floor(Math.random() * mockUrls.length)];
  res.json({ url });
});

// ----------------------------------------------------
// Static files & dev setup
// ----------------------------------------------------

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }
app.listen(PORT, async () => {
    console.log(`ClubSphere Full-Stack Server running on port ${PORT}`);

    await open(`http://localhost:${PORT}`);
});
}

startServer();
