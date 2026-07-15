import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { Club, ClubMember, JoinRequest } from "../types";
import { 
  Search, Plus, Check, X, Users, Compass, FolderOpen, ArrowRight, 
  Trash2, AlertCircle, Loader2, MessageSquare, Image, CheckCircle 
} from "lucide-react";

export const ClubsView: React.FC = () => {
  const { user } = useAuth();
  const [clubs, setClubs] = useState<Club[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Searching & Filtering
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  
  // Selection / Detail / Subviews
  const [selectedClub, setSelectedClub] = useState<Club | null>(null);
  const [clubMembersList, setClubMembersList] = useState<ClubMember[]>([]);
  const [joinRequestsList, setJoinRequestsList] = useState<JoinRequest[]>([]);
  const [loadingDetails, setLoadingDetails] = useState(false);
  
  // Form States
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newClubName, setNewClubName] = useState("");
  const [newClubDesc, setNewClubDesc] = useState("");
  const [newClubCategory, setNewClubCategory] = useState("Technology");
  const [newClubBanner, setNewClubBanner] = useState("");
  const [submittingClub, setSubmittingClub] = useState(false);
  
  const [joinMessage, setJoinMessage] = useState("I am highly motivated to join and collaborate!");
  const [submittingJoin, setSubmittingJoin] = useState(false);
  
  // Success toast helper
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const fetchClubs = async () => {
    setLoading(true);
    try {
      const response = await axios.get("/api/clubs");
      // Normalize: backend may return `clubName` OR `name` — ensure `name` is always populated
      const normalized = (response.data as any[]).map((c: any) => ({
        ...c,
        name: c.name || c.clubName || "Unnamed Club",
        description: c.description || "",
        bannerUrl: c.bannerUrl || "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=400",
        status: c.status || "PENDING",
      }));
      setClubs(normalized);
      setError(null);
    } catch (err) {
      console.error("Error fetching clubs", err);
      setError("Failed to fetch clubs from system directory.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClubs();
  }, []);

  const selectClubDetails = async (club: Club) => {
    setSelectedClub(club);
    setLoadingDetails(true);
    try {
      // Get Members
      const membersRes = await axios.get(`/api/clubs/${club.id}/members`);
      setClubMembersList(membersRes.data);

      // Get Join Requests if Creator/Admin
      if (club.creatorId === user?.id || user?.role === "ROLE_ADMIN") {
        const reqsRes = await axios.get(`/api/clubs/${club.id}/requests`);
        setJoinRequestsList(reqsRes.data);
      }
    } catch (err) {
      console.error("Failed to load club details", err);
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleCreateClub = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClubName || !newClubDesc) return;
    setSubmittingClub(true);
    try {
      const response = await axios.post("/api/clubs", {
        name: newClubName,
        description: newClubDesc,
        category: newClubCategory,
        bannerUrl: newClubBanner || "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=400"
      });
      const created = response.data;
      if (created.status === "APPROVED") {
        triggerToast(`Club "${newClubName}" created and approved!`);
      } else {
        triggerToast(`Club request for "${newClubName}" submitted for Admin verification!`);
      }
      setShowCreateForm(false);
      setNewClubName("");
      setNewClubDesc("");
      setNewClubBanner("");
      fetchClubs();
    } catch (err: any) {
      triggerToast(err.response?.data?.message || "Club creation failed.");
    } finally {
      setSubmittingClub(false);
    }
  };

  const handleJoinRequest = async () => {
    if (!selectedClub) return;
    setSubmittingJoin(true);
    try {
      await axios.post(`/api/clubs/${selectedClub.id}/join`, {
        requestMessage: joinMessage
      });
      triggerToast("Join request submitted successfully!");
      // Refresh current details
      selectClubDetails(selectedClub);
    } catch (err: any) {
      triggerToast(err.response?.data?.message || "Failed to submit request.");
    } finally {
      setSubmittingJoin(false);
    }
  };

  const handleLeaveClub = async () => {
    if (!selectedClub) return;
    if (!window.confirm("Are you sure you want to leave this club?")) return;
    try {
      await axios.post(`/api/clubs/${selectedClub.id}/leave`);
      triggerToast("You have left the club.");
      selectClubDetails(selectedClub);
      fetchClubs();
    } catch (err: any) {
      triggerToast(err.response?.data?.message || "Failed to leave club.");
    }
  };

  const handleApproveRequest = async (requestId: number, status: "APPROVED" | "REJECTED") => {
    try {
      await axios.put(`/api/clubs/requests/${requestId}`, { status });
      triggerToast(`Request ${status === "APPROVED" ? "Approved" : "Rejected"} successfully!`);
      if (selectedClub) selectClubDetails(selectedClub);
      fetchClubs();
    } catch (err: any) {
      triggerToast("Failed to respond to request.");
    }
  };

  const handleDeleteClub = async (clubId: number) => {
    if (!window.confirm("CRITICAL WARNING: Are you sure you want to delete this club? This action clears all memberships and cannot be undone.")) return;
    try {
      await axios.delete(`/api/clubs/${clubId}`);
      triggerToast("Club deleted successfully.");
      setSelectedClub(null);
      fetchClubs();
    } catch (err: any) {
      triggerToast("Failed to delete club.");
    }
  };

  // Category list for filtering
  const categories = ["ALL", "Technology", "Business", "Arts & Culture", "Social Service", "Sports"];

  // Filter & Search logic
  const filteredClubs = clubs.filter(c => {
    const name = c.name || "";
    const desc = c.description || "";
    const matchesSearch = name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          desc.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = selectedCategory === "ALL" || c.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  const isUserMember = selectedClub && clubMembersList.some(m => m.userId === user?.id);
  const isPendingRequest = selectedClub && joinRequestsList.some(r => r.userId === user?.id && r.status === "PENDING");
  const isUserCreator = selectedClub && (selectedClub.creatorId === user?.id || user?.role === "ROLE_ADMIN");

  return (
    <div className="space-y-6 animate-fade-in relative">
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="fixed top-4 right-4 bg-indigo-600 text-white font-mono text-xs px-4 py-3 rounded-xl shadow-2xl border border-indigo-500/30 z-50 flex items-center gap-2 animate-bounce-slow">
          <CheckCircle className="h-4 w-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header with action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-display font-bold text-xl text-white">Campus Club Hub</h2>
          <p className="text-xs text-slate-400">Discover groups, collaborate on initiatives, or manage your active assemblies.</p>
        </div>
        {user?.role !== "ROLE_STUDENT" && (
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="self-start text-xs bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-lg font-medium transition-all flex items-center gap-2 shadow-md shadow-indigo-600/10 font-mono"
          >
            <Plus className="h-4 w-4" />
            {showCreateForm ? "Close Form" : "Register New Club"}
          </button>
        )}
      </div>

      {/* Club Creation Form */}
      {showCreateForm && (
        <form onSubmit={handleCreateClub} className="bg-[#16191f] border border-indigo-500/20 rounded-2xl p-6 space-y-4 animate-slide-up">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <FolderOpen className="h-4 w-4 text-indigo-400" />
            <h3 className="font-display font-bold text-sm text-white">New Club Registration Request</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-mono uppercase text-slate-400 mb-1">Club Name</label>
              <input
                type="text"
                required
                value={newClubName}
                onChange={(e) => setNewClubName(e.target.value)}
                placeholder="e.g. Artificial Intelligence Club"
                className="w-full px-3 py-2 bg-[#090a0c] border border-slate-800 rounded-lg text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>
            <div>
              <label className="block text-[10px] font-mono uppercase text-slate-400 mb-1">Category</label>
              <select
                value={newClubCategory}
                onChange={(e) => setNewClubCategory(e.target.value)}
                className="w-full px-3 py-2 bg-[#090a0c] border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-indigo-500 transition-colors"
              >
                {categories.filter(c => c !== "ALL").map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-mono uppercase text-slate-400 mb-1">Banner Image URL (Optional)</label>
            <input
              type="url"
              value={newClubBanner}
              onChange={(e) => setNewClubBanner(e.target.value)}
              placeholder="https://images.unsplash.com/photo-..."
              className="w-full px-3 py-2 bg-[#090a0c] border border-slate-800 rounded-lg text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-colors font-mono"
            />
          </div>

          <div>
            <label className="block text-[10px] font-mono uppercase text-slate-400 mb-1">Description & Goal</label>
            <textarea
              required
              rows={3}
              value={newClubDesc}
              onChange={(e) => setNewClubDesc(e.target.value)}
              placeholder="What are the mission statements, goals, or prerequisites of this club?"
              className="w-full px-3 py-2 bg-[#090a0c] border border-slate-800 rounded-lg text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setShowCreateForm(false)}
              className="px-4 py-2 bg-slate-900 hover:bg-[#090a0c] border border-slate-800 text-slate-400 text-xs rounded-lg transition-colors font-mono"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submittingClub}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-mono rounded-lg transition-colors flex items-center gap-1"
            >
              {submittingClub ? <Loader2 className="h-3 w-3 animate-spin" /> : "Submit Request"}
            </button>
          </div>
        </form>
      )}

      {/* Main Panel layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 cols: Search and Clubs List */}
        <div className="lg:col-span-2 space-y-4">
          
          {/* Controls Bar */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                <Search className="h-4 w-4" />
              </span>
              <input
                type="text"
                placeholder="Search by club name or keyword..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-[#16191f] border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>
            
            {/* Category horizontal filters */}
            <div className="flex gap-1.5 overflow-x-auto pb-1 max-w-full">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 text-[10px] font-mono rounded-lg border transition-all cursor-pointer whitespace-nowrap ${
                    selectedCategory === cat 
                    ? "bg-indigo-600/20 text-indigo-400 border-indigo-500" 
                    : "bg-[#16191f] text-slate-400 border-slate-800 hover:text-white"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="h-48 flex justify-center items-center">
              <Loader2 className="h-6 w-6 text-indigo-500 animate-spin" />
            </div>
          ) : error ? (
            <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl text-center text-xs text-rose-400 font-mono">
              {error}
            </div>
          ) : filteredClubs.length === 0 ? (
            <div className="p-12 bg-[#16191f]/60 border border-slate-800 rounded-2xl text-center">
              <Compass className="h-8 w-8 text-slate-600 mx-auto mb-3" />
              <p className="text-xs text-slate-400 font-mono">No student groups found matching details.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {filteredClubs.map(club => (
                <div 
                  key={club.id}
                  onClick={() => selectClubDetails(club)}
                  className={`bg-[#16191f] border rounded-2xl overflow-hidden cursor-pointer hover:scale-[1.01] hover:border-indigo-500/40 transition-all flex flex-col h-full ${
                    selectedClub?.id === club.id ? "border-indigo-600 ring-1 ring-indigo-600/30" : "border-slate-800"
                  }`}
                >
                  {/* Banner block */}
                  <div className="h-28 relative bg-slate-900">
                    <img 
                      src={club.bannerUrl} 
                      alt={club.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover opacity-80"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=400";
                      }}
                    />
                    <div className="absolute top-2 right-2 bg-slate-950/80 backdrop-blur-md px-2 py-0.5 rounded-md text-[9px] font-mono font-medium text-indigo-400 border border-indigo-500/20 uppercase">
                      {club.category}
                    </div>

                    {club.status !== "APPROVED" && (
                      <div className="absolute top-2 left-2 bg-amber-600 text-white px-2 py-0.5 rounded-md text-[9px] font-mono uppercase">
                        {club.status}
                      </div>
                    )}
                  </div>

                  {/* Body */}
                  <div className="p-4 flex-1 flex flex-col justify-between space-y-4">
                    <div>
                      <h3 className="font-display font-semibold text-white text-sm tracking-tight">{club.name}</h3>
                      <p className="text-slate-400 text-xs mt-1.5 line-clamp-2 leading-relaxed">{club.description}</p>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-slate-800/60 text-[10px] font-mono text-slate-500">
                      <span className="flex items-center gap-1">
                        <Users className="h-3.5 w-3.5 text-indigo-400" />
                        Active Members
                      </span>
                      <span className="text-white font-bold font-mono">
                        View Details →
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right 1 col: Selected Club Detail Info & Console */}
        <div className="lg:col-span-1">
          {selectedClub ? (
            <div className="bg-[#16191f] border border-slate-800 rounded-2xl p-5 space-y-6 sticky top-24">
              
              {/* Club Title header info */}
              <div className="space-y-3">
                <div className="h-20 w-full rounded-xl overflow-hidden">
                  <img 
                    src={selectedClub.bannerUrl} 
                    alt={selectedClub.name} 
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <span className="text-[9px] font-mono bg-indigo-600/10 border border-indigo-500/20 text-indigo-400 px-2.5 py-0.5 rounded-full uppercase">
                    {selectedClub.category}
                  </span>
                  <h3 className="font-display font-bold text-white text-base mt-2">{selectedClub.name}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed mt-1">{selectedClub.description}</p>
                </div>
                <div className="text-[10px] font-mono text-slate-500">
                  <p>Club Sponsor: <span className="text-slate-300 font-bold">{selectedClub.creatorName || "Staff Admin"}</span></p>
                  <p className="mt-0.5">Created On: <span className="text-slate-400">{new Date(selectedClub.createdAt).toLocaleDateString()}</span></p>
                </div>
              </div>

              {/* Loader for Details */}
              {loadingDetails ? (
                <div className="py-4 text-center">
                  <Loader2 className="h-5 w-5 animate-spin text-indigo-500 mx-auto" />
                </div>
              ) : (
                <div className="space-y-6 pt-4 border-t border-slate-800/80">
                  
                  {/* Join / Leave / Manage buttons */}
                  <div className="space-y-3">
                    {isUserCreator ? (
                      <div className="space-y-2">
                        <div className="p-3 bg-indigo-500/5 rounded-xl border border-indigo-500/10 text-center text-xs text-indigo-400 font-mono">
                          ★ You are the Manager of this Club
                        </div>
                        <button
                          onClick={() => handleDeleteClub(selectedClub.id)}
                          className="w-full py-2 bg-rose-500/10 hover:bg-rose-500 text-rose-400 hover:text-white border border-rose-500/20 text-xs font-mono rounded-lg transition-all flex items-center justify-center gap-1.5"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          Delete Club Entity
                        </button>
                      </div>
                    ) : isUserMember ? (
                      <div className="space-y-2">
                        <div className="p-3 bg-emerald-500/5 rounded-xl border border-emerald-500/20 text-center text-xs text-emerald-400 font-mono flex items-center justify-center gap-1.5">
                          <Check className="h-4 w-4" /> Active Club Member
                        </div>
                        <button
                          onClick={handleLeaveClub}
                          className="w-full py-1.5 bg-[#090a0c] hover:bg-rose-900 border border-slate-800 hover:border-rose-700 hover:text-white text-slate-400 text-xs font-mono rounded-lg transition-all"
                        >
                          Leave Club
                        </button>
                      </div>
                    ) : isPendingRequest ? (
                      <div className="p-3 bg-amber-500/5 rounded-xl border border-amber-500/20 text-center text-xs text-amber-400 font-mono">
                        ⏳ Membership request is pending approval
                      </div>
                    ) : selectedClub.status === "APPROVED" ? (
                      <div className="space-y-2">
                        <label className="block text-[9px] font-mono uppercase text-slate-500">Short intro/motivational pitch</label>
                        <input
                          type="text"
                          value={joinMessage}
                          onChange={(e) => setJoinMessage(e.target.value)}
                          className="w-full px-2.5 py-1.5 bg-[#090a0c] border border-slate-800 rounded text-xs text-white focus:outline-none focus:border-indigo-500"
                        />
                        <button
                          onClick={handleJoinRequest}
                          disabled={submittingJoin}
                          className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-mono rounded-lg transition-all flex items-center justify-center gap-1"
                        >
                          {submittingJoin ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Request to Join Club"}
                          <ArrowRight className="h-3 w-3" />
                        </button>
                      </div>
                    ) : (
                      <div className="p-3 bg-amber-500/5 rounded-xl border border-amber-500/20 text-center text-xs text-amber-400 font-mono">
                        This club is pending approval from system administrators.
                      </div>
                    )}
                  </div>

                  {/* Club Members list */}
                  <div className="space-y-2">
                    <h4 className="text-[10px] font-mono uppercase text-slate-500 tracking-wider">Members Directory ({clubMembersList.length})</h4>
                    <div className="max-h-40 overflow-y-auto space-y-2 pr-1">
                      {clubMembersList.map(member => (
                        <div key={member.userId} className="flex items-center justify-between p-2 rounded bg-[#090a0c] border border-slate-800 text-[10px] font-mono">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-slate-800 text-[10px] flex items-center justify-center text-white">
                              {member.firstName.substring(0, 1)}
                            </div>
                            <div>
                              <p className="text-slate-300 font-bold">{member.firstName} {member.lastName}</p>
                              <p className="text-[8px] text-slate-500">{member.email}</p>
                            </div>
                          </div>
                          <span className={`px-1.5 py-0.5 rounded text-[8px] uppercase ${member.role === 'PRESIDENT' ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30' : 'bg-slate-800 text-slate-400'}`}>
                            {member.role}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Join Requests - ONLY Visible to manager/admin */}
                  {isUserCreator && (
                    <div className="space-y-2 pt-2 border-t border-slate-800/60">
                      <h4 className="text-[10px] font-mono uppercase text-indigo-400 tracking-wider">Incoming Join Requests ({joinRequestsList.filter(r => r.status === 'PENDING').length})</h4>
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {joinRequestsList.filter(r => r.status === "PENDING").length === 0 ? (
                          <p className="text-[10px] font-mono text-slate-600 text-center py-2">No active pending join queries.</p>
                        ) : (
                          joinRequestsList.filter(r => r.status === "PENDING").map(req => (
                            <div key={req.id} className="p-3 rounded-lg bg-[#090a0c] border border-slate-800 text-[10px] font-mono space-y-2">
                              <div className="flex justify-between items-start">
                                <div>
                                  <p className="text-white font-bold">{req.user?.firstName} {req.user?.lastName}</p>
                                  <p className="text-[8px] text-slate-500">{req.user?.email}</p>
                                </div>
                                <span className="text-[8px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded uppercase">Pending</span>
                              </div>
                              <p className="text-slate-400 text-[9px] bg-slate-900 p-2 rounded border border-slate-800 leading-relaxed italic">
                                "{req.requestMessage}"
                              </p>
                              <div className="flex gap-2 justify-end">
                                <button
                                  onClick={() => handleApproveRequest(req.id, "REJECTED")}
                                  className="p-1 px-2 bg-rose-500/10 hover:bg-rose-500 text-rose-400 hover:text-white rounded border border-rose-500/20 transition-colors"
                                >
                                  Decline
                                </button>
                                <button
                                  onClick={() => handleApproveRequest(req.id, "APPROVED")}
                                  className="p-1 px-2 bg-emerald-500/10 hover:bg-emerald-500 text-emerald-400 hover:text-white rounded border border-emerald-500/20 transition-colors"
                                >
                                  Approve
                                </button>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}

                </div>
              )}
            </div>
          ) : (
            <div className="bg-[#16191f] border border-slate-800 rounded-2xl p-6 text-center text-xs text-slate-500 font-mono py-12 sticky top-24">
              <Compass className="h-8 w-8 text-slate-600 mx-auto mb-3" />
              Click any club card on the left to inspect its active directory, pending join requests, and management dashboard.
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
