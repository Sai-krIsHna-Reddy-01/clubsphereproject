import React, { useState, useEffect } from "react";
import axios from "axios";
import { Notification } from "../types";
import { Bell, Check, Loader2, Calendar } from "lucide-react";

export const NotificationsView: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const response = await axios.get("/api/notifications");
      setNotifications(response.data);
      setError(null);
    } catch (err) {
      console.error("Failed to load notifications", err);
      setError("Failed to retrieve user notifications.");
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await axios.put("/api/notifications/mark-read");
      fetchNotifications();
    } catch (err) {
      console.error("Failed to mark notifications read", err);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="space-y-6 max-w-2xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="font-display font-bold text-xl text-white">System Alerts</h2>
          <p className="text-xs text-slate-400">Personal notification center and campus log alerts.</p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllRead}
            className="text-xs text-indigo-400 hover:text-indigo-300 font-mono flex items-center gap-1 bg-[#16191f] border border-slate-800 px-3 py-1.5 rounded-lg"
          >
            <Check className="h-3.5 w-3.5 text-indigo-400" />
            Mark All Read
          </button>
        )}
      </div>

      {loading ? (
        <div className="h-48 flex justify-center items-center">
          <Loader2 className="h-6 w-6 text-indigo-500 animate-spin" />
        </div>
      ) : error ? (
        <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl text-center text-xs text-rose-400 font-mono">
          {error}
        </div>
      ) : notifications.length === 0 ? (
        <div className="p-12 bg-[#16191f] border border-slate-800 rounded-2xl text-center">
          <Bell className="h-8 w-8 text-slate-600 mx-auto mb-3" />
          <p className="text-xs text-slate-400 font-mono">Your notification tray is empty.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map(notif => (
            <div
              key={notif.id}
              className={`p-4 bg-[#16191f] border rounded-xl flex items-start gap-3 transition-colors ${
                notif.isRead ? "border-slate-850 opacity-80" : "border-indigo-500/20 shadow-md shadow-indigo-600/5"
              }`}
            >
              {/* Status bullet indicator */}
              <div className="pt-1">
                <div className={`w-2.5 h-2.5 rounded-full ${notif.isRead ? 'bg-slate-700' : 'bg-indigo-500 animate-pulse'}`} />
              </div>

              {/* Message */}
              <div className="flex-1 space-y-1">
                <p className={`text-xs ${notif.isRead ? 'text-slate-400' : 'text-slate-100 font-medium'}`}>
                  {notif.message}
                </p>
                <p className="text-[9px] font-mono text-slate-500 flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5 text-indigo-400" />
                  {new Date(notif.createdAt).toLocaleDateString()} at {new Date(notif.createdAt).toLocaleTimeString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
};
