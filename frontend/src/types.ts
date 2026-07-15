// ClubSphere Global Types Declarations
// Senior Architect Clean Code Architecture

export type UserRole = "ROLE_ADMIN" | "ROLE_CLUB_MANAGER" | "ROLE_STUDENT";

export interface User {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  profilePictureUrl?: string;
}

export type ClubStatus = "PENDING" | "APPROVED" | "REJECTED";

export interface Club {
  id: number;
  name: string;
  description: string;
  category: string;
  bannerUrl: string;
  status: ClubStatus;
  creatorId: number;
  createdAt: string;
  creatorName?: string;
  membersCount?: number;
}

export interface ClubMember {
  membershipId: number;
  userId: number;
  role: "PRESIDENT" | "VICE_PRESIDENT" | "MEMBER";
  joinedAt: string;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  profilePictureUrl?: string;
}

export interface JoinRequest {
  id: number;
  clubId: number;
  userId: number;
  status: "PENDING" | "APPROVED" | "REJECTED";
  requestMessage: string;
  createdAt: string;
  user?: {
    id: number;
    firstName: string;
    lastName: string;
    username: string;
    email: string;
    profilePictureUrl?: string;
  };
}

export interface ClubEvent {
  id: number;
  clubId: number;
  title: string;
  description: string;
  bannerUrl: string;
  eventDate: string;
  eventTime: string;
  location: string;
  createdAt: string;
  clubName?: string;
  registrationsCount?: number;
}

export interface EventRegistration {
  id: number;
  eventId: number;
  userId: number;
  registeredAt: string;
  status: "REGISTERED" | "CANCELLED";
  attended: boolean;
  user?: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    username: string;
  };
}

export interface Certificate {
  id: number;
  eventId: number;
  userId: number;
  certificateCode: string;
  issuedAt: string;
  downloadUrl: string;
  eventTitle?: string;
  eventDate?: string;
  studentName?: string;
}

export interface Notification {
  id: number;
  userId: number;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export interface Announcement {
  id: number;
  clubId: number | null; // null represents system announcement
  title: string;
  content: string;
  createdAt: string;
  clubName?: string;
}

export interface ActivityLog {
  id: number;
  userId: number | null;
  action: string;
  ipAddress: string;
  timestamp: string;
  username?: string;
}

export interface DashboardStats {
  totalClubs: number;
  totalEvents: number;
  totalStudents: number;
  totalRegistrations: number;
  monthlyEvents: Array<{ name: string; count: number }>;
  clubGrowth: Array<{ name: string; clubs: number }>;
  mostActiveClubs: Array<{ name: string; score: number }>;
  participationStats: Array<{ name: string; value: number }>;
}
