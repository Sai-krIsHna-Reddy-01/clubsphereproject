import React, { useState } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { LoginView } from "./components/LoginView";
import { DashboardView } from "./components/DashboardView";
import { ClubsView } from "./components/ClubsView";
import { EventsView } from "./components/EventsView";
import { AnnouncementsView } from "./components/AnnouncementsView";
import { CertificatesView } from "./components/CertificatesView";
import { NotificationsView } from "./components/NotificationsView";
import { AdminView } from "./components/AdminView";
import { BlueprintView } from "./components/BlueprintView";

import { 
  Layers, LayoutDashboard, Compass, Calendar, Megaphone, 
  Award, Bell, ShieldCheck, FolderOpen, LogOut, Menu, X, 
  User, Sparkles, CheckCircle
} from "lucide-react";

// Wrap App component in AuthProvider to handle session state
export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

function AppContent() {
  const { user, logout, loading } = useAuth();
  const [activeTab, setActiveTab] = useState<string>("dashboard");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#090a0c] flex flex-col justify-center items-center font-mono text-xs text-indigo-400 gap-3">
        <div className="h-6 w-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
        <span>INITIALIZING CLUBSPHERE CORE ENGINE...</span>
      </div>
    );
  }

  // If no user session exists, present the authentication page
  if (!user) {
    return <LoginView />;
  }

  // Navigation Items with Roles checking
  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "clubs", label: "Campus Clubs", icon: Compass },
    { id: "events", label: "Events Calendar", icon: Calendar },
    { id: "announcements", label: "Announcements", icon: Megaphone },
    { id: "certificates", label: "My Certificates", icon: Award },
    { id: "notifications", label: "System Alerts", icon: Bell },
    { id: "blueprint", label: "System Blueprints", icon: FolderOpen },
  ];

  // Admin section only visible to privileged roles
  const isAdmin = user.role === "ROLE_ADMIN";

  const renderActiveView = () => {
    switch (activeTab) {
      case "dashboard":
        return <DashboardView />;
      case "clubs":
        return <ClubsView />;
      case "events":
        return <EventsView />;
      case "announcements":
        return <AnnouncementsView />;
      case "certificates":
        return <CertificatesView />;
      case "notifications":
        return <NotificationsView />;
      case "blueprint":
        return <BlueprintView />;
      case "admin":
        return <AdminView />;
      default:
        return <DashboardView />;
    }
  };

  // Humanize user roles for badge tags
  const getRoleLabel = (role: string) => {
    switch (role) {
      case "ROLE_ADMIN": return "System Admin";
      case "ROLE_CLUB_MANAGER": return "Club Manager";
      default: return "Student Operator";
    }
  };

  return (
    <div className="min-h-screen bg-[#090a0c] text-slate-300 font-sans selection:bg-indigo-600 selection:text-white flex flex-col md:flex-row">
      
      {/* Mobile Top Header */}
      <header className="md:hidden border-b border-slate-800 bg-[#111318] px-4 py-3 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <div className="bg-indigo-600 p-1.5 rounded-lg">
            <Layers className="h-4 w-4 text-white" />
          </div>
          <span className="font-display font-bold text-sm text-white">ClubSphere</span>
        </div>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-1.5 text-slate-400 hover:text-white rounded"
        >
          {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </header>

      {/* Sidebar Navigation */}
      <aside className={`w-full md:w-64 shrink-0 bg-[#111318] border-r border-slate-850 flex flex-col justify-between fixed md:sticky top-[53px] md:top-0 h-[calc(100vh-53px)] md:h-screen z-45 transition-transform md:translate-x-0 ${
        mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
      }`}>
        <div className="p-5 flex-1 flex flex-col justify-between space-y-6 overflow-y-auto">
          {/* Top Logo */}
          <div className="hidden md:flex items-center gap-2 border-b border-slate-800/60 pb-5">
            <div className="bg-indigo-600 p-2 rounded-xl shadow-lg shadow-indigo-600/25">
              <Layers className="h-5 w-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-display font-bold text-base tracking-tight text-white">ClubSphere</span>
                <span className="bg-emerald-500/10 text-emerald-400 text-[8px] font-mono px-1.5 py-0.5 rounded-full border border-emerald-500/20 uppercase font-bold">Live</span>
              </div>
              <p className="text-[10px] text-slate-500 font-mono">Event Collaboration</p>
            </div>
          </div>

          {/* Navigation links */}
          <nav className="space-y-1">
            <span className="block text-[8px] font-mono text-slate-600 uppercase tracking-widest pl-2 mb-2">Navigation Console</span>
            {navItems.map(item => {
              const Icon = item.icon;
              const isSelected = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium font-mono transition-all border ${
                    isSelected 
                    ? "bg-indigo-600/10 text-indigo-400 border-indigo-500/20" 
                    : "border-transparent text-slate-400 hover:text-white hover:bg-[#16191f]/50"
                  }`}
                >
                  <Icon className={`h-4 w-4 ${isSelected ? "text-indigo-400" : "text-slate-500"}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}

            {/* Admin specific link */}
            {isAdmin && (
              <div className="pt-4 border-t border-slate-800/60 mt-4 space-y-1">
                <span className="block text-[8px] font-mono text-indigo-400/85 uppercase tracking-widest pl-2 mb-2">Security Console</span>
                <button
                  onClick={() => {
                    setActiveTab("admin");
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium font-mono transition-all border ${
                    activeTab === "admin" 
                    ? "bg-indigo-600/10 text-indigo-400 border-indigo-500/20" 
                    : "border-transparent text-slate-400 hover:text-white hover:bg-[#16191f]/50"
                  }`}
                >
                  <ShieldCheck className="h-4 w-4 text-indigo-400" />
                  <span>Admin Panel</span>
                </button>
              </div>
            )}
          </nav>

          {/* Connected Identity / User Profile Card */}
          <div className="bg-[#16191f] border border-slate-850 p-4 rounded-2xl space-y-3 mt-auto shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-white text-xs font-bold">
                {user.firstName.substring(0, 1)}{user.lastName.substring(0, 1)}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-white truncate">{user.firstName} {user.lastName}</p>
                <span className="text-[8px] font-mono font-extrabold uppercase bg-indigo-500/10 text-indigo-400 px-2 py-0.5 rounded border border-indigo-500/25 mt-0.5 inline-block">
                  {getRoleLabel(user.role)}
                </span>
              </div>
            </div>
            <button
              onClick={() => {
                logout();
                setMobileMenuOpen(false);
              }}
              className="w-full py-1.5 hover:bg-rose-950/40 border border-slate-800 hover:border-rose-900/40 text-slate-400 hover:text-rose-400 text-[10px] font-mono rounded-lg transition-all flex items-center justify-center gap-2"
            >
              <LogOut className="h-3.5 w-3.5" />
              Disconnect Session
            </button>
          </div>
        </div>
      </aside>

      {/* Main Screen Frame */}
      <main className="flex-1 min-w-0 px-4 sm:px-6 md:px-8 py-6 md:py-8 overflow-y-auto max-w-7xl mx-auto space-y-6">
        {renderActiveView()}
      </main>

    </div>
  );
}
