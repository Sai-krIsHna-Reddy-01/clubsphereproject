import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { Club, Announcement } from "../types";
import { Megaphone, Plus, Calendar, AlertCircle, Loader2, Sparkles, FolderOpen } from "lucide-react";

export const AnnouncementsView: React.FC = () => {
  const { user } = useAuth();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [clubs, setClubs] = useState<Club[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form States
  const [showForm, setShowForm] = useState(false);
  const [selectedClubId, setSelectedClubId] = useState<string>("");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const fetchAnnouncementsAndClubs = async () => {
    setLoading(true);
    try {
      const annRes = await axios.get("/api/announcements");
      setAnnouncements(annRes.data);

      const clubsRes = await axios.get("/api/clubs");
      // Filter clubs where current user is Creator or if Admin
      const ownedClubs = clubsRes.data.filter((c: Club) => c.status === "APPROVED" && (c.creatorId === user?.id || user?.role === "ROLE_ADMIN"));
      setClubs(ownedClubs);
      
      // Default option: System announcement if admin, else their first owned club
      if (user?.role === "ROLE_ADMIN") {
        setSelectedClubId("system");
      } else if (ownedClubs.length > 0) {
        setSelectedClubId(ownedClubs[0].id.toString());
      }
      
      setError(null);
    } catch (err) {
      console.error("Failed to load announcements", err);
      setError("Failed to fetch announcements bulletin.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncementsAndClubs();
  }, []);

  const handlePostAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !content) return;
    setSubmitting(true);
    try {
      const clubId = selectedClubId === "system" ? null : parseInt(selectedClubId);
      await axios.post("/api/announcements", {
        clubId,
        title,
        content
      });
      triggerToast("Announcement posted successfully!");
      setShowForm(false);
      setTitle("");
      setContent("");
      fetchAnnouncementsAndClubs();
    } catch (err: any) {
      triggerToast(err.response?.data?.message || "Failed to post announcement.");
    } finally {
      setSubmitting(false);
    }
  };

  // Check if current user has permissions to post any announcements
  const canPost = user?.role === "ROLE_ADMIN" || clubs.length > 0;

  return (
    <div className="space-y-6 animate-fade-in relative">
      {/* Toast Helper */}
      {toastMessage && (
        <div className="fixed top-4 right-4 bg-indigo-600 text-white font-mono text-xs px-4 py-3 rounded-xl shadow-2xl border border-indigo-500/30 z-50 flex items-center gap-2 animate-bounce-slow">
          <Megaphone className="h-4 w-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-display font-bold text-xl text-white">Campus Bulletin</h2>
          <p className="text-xs text-slate-400">Official system broadcasts and verified student club announcements.</p>
        </div>
        {canPost && (
          <button
            onClick={() => setShowForm(!showForm)}
            className="self-start text-xs bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-lg font-medium transition-all flex items-center gap-2 shadow-md shadow-indigo-600/10 font-mono"
          >
            <Plus className="h-4 w-4" />
            {showForm ? "Hide Form" : "Broadcast Announcement"}
          </button>
        )}
      </div>

      {/* Create Announcement Form */}
      {showForm && (
        <form onSubmit={handlePostAnnouncement} className="bg-[#16191f] border border-indigo-500/20 rounded-2xl p-6 space-y-4 animate-slide-up">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <Megaphone className="h-4 w-4 text-indigo-400" />
            <h3 className="font-display font-bold text-sm text-white">Broadcast Announcement</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-[10px] font-mono uppercase text-slate-400 mb-1">Target Channel</label>
              <select
                value={selectedClubId}
                onChange={(e) => setSelectedClubId(e.target.value)}
                className="w-full px-3 py-2 bg-[#090a0c] border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-indigo-500"
              >
                {user?.role === "ROLE_ADMIN" && (
                  <option value="system">System-Wide Broadcast</option>
                )}
                {clubs.map(club => (
                  <option key={club.id} value={club.id}>{club.name} Channel</option>
                ))}
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-[10px] font-mono uppercase text-slate-400 mb-1">Subject Header</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Schedule Alterations or Room Updates"
                className="w-full px-3 py-2 bg-[#090a0c] border border-slate-800 rounded-lg text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-mono uppercase text-slate-400 mb-1">Announcement Content</label>
            <textarea
              required
              rows={4}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="What details would you like to broadcast? Support standard informational notes."
              className="w-full px-3 py-2 bg-[#090a0c] border border-slate-800 rounded-lg text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-4 py-2 bg-slate-900 hover:bg-[#090a0c] border border-slate-800 text-slate-400 text-xs rounded-lg transition-colors font-mono"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-mono rounded-lg transition-colors flex items-center gap-1"
            >
              {submitting ? <Loader2 className="h-3 w-3 animate-spin" /> : "Broadcast"}
            </button>
          </div>
        </form>
      )}

      {/* Announcements Stream */}
      <div className="max-w-3xl mx-auto space-y-4">
        {loading ? (
          <div className="h-48 flex justify-center items-center">
            <Loader2 className="h-6 w-6 text-indigo-500 animate-spin" />
          </div>
        ) : error ? (
          <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl text-center text-xs text-rose-400 font-mono">
            {error}
          </div>
        ) : announcements.length === 0 ? (
          <div className="p-12 bg-[#16191f] border border-slate-800 rounded-2xl text-center">
            <Megaphone className="h-8 w-8 text-slate-600 mx-auto mb-3" />
            <p className="text-xs text-slate-400 font-mono">No active announcements posted.</p>
          </div>
        ) : (
          announcements.map(ann => {
            const isSystem = ann.clubId === null;
            return (
              <div 
                key={ann.id} 
                className={`p-6 rounded-2xl border transition-all ${
                  isSystem 
                  ? "bg-indigo-600/5 border-indigo-500/20 shadow-indigo-600/5 shadow-lg" 
                  : "bg-[#16191f] border-slate-800"
                }`}
              >
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-[8px] font-mono uppercase tracking-wider ${
                        isSystem 
                        ? "bg-indigo-600/20 text-indigo-400 border border-indigo-500/30" 
                        : "bg-slate-900 text-slate-400 border border-slate-800"
                      }`}>
                        {isSystem ? "★ System Broadcast" : ann.clubName}
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5 text-indigo-400" />
                        {new Date(ann.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <h3 className="font-display font-semibold text-white text-base mt-2.5 tracking-tight">{ann.title}</h3>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 shrink-0">
                    <Megaphone className={`h-4 w-4 ${isSystem ? 'text-indigo-400 animate-pulse' : 'text-slate-500'}`} />
                  </div>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed mt-4 bg-slate-950/30 border border-slate-800/40 p-4 rounded-xl whitespace-pre-line">
                  {ann.content}
                </p>
              </div>
            );
          })
        )}
      </div>

    </div>
  );
};
