import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { Club, ClubEvent, EventRegistration } from "../types";
import { 
  Calendar, MapPin, Clock, Award, Plus, Check, X, Users, 
  Trash2, AlertCircle, Loader2, Edit3, ShieldCheck, CheckCircle2 
} from "lucide-react";

export const EventsView: React.FC = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState<ClubEvent[]>([]);
  const [myClubs, setMyClubs] = useState<Club[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Subviews / Selection
  const [selectedEvent, setSelectedEvent] = useState<ClubEvent | null>(null);
  const [registrations, setRegistrations] = useState<EventRegistration[]>([]);
  const [loadingRegs, setLoadingRegs] = useState(false);

  // Create Event Form States
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [targetClubId, setTargetClubId] = useState("");
  const [eventTitle, setEventTitle] = useState("");
  const [eventDesc, setEventDesc] = useState("");
  const [eventBanner, setEventBanner] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [eventTime, setEventTime] = useState("");
  const [eventLocation, setEventLocation] = useState("");
  const [submittingEvent, setSubmittingEvent] = useState(false);

  // Status indicators
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const fetchEventsAndClubs = async () => {
    setLoading(true);
    try {
      const eventsRes = await axios.get("/api/events");
      setEvents(eventsRes.data);

      const clubsRes = await axios.get("/api/clubs");
      // Find clubs created by me (so I can schedule events for them)
      const filtered = clubsRes.data.filter((c: Club) => c.status === "APPROVED" && (c.creatorId === user?.id || user?.role === "ROLE_ADMIN"));
      setMyClubs(filtered);
      if (filtered.length > 0) setTargetClubId(filtered[0].id.toString());

      setError(null);
    } catch (err) {
      console.error("Failed to load events/clubs", err);
      setError("Failed to fetch campus events calendar.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEventsAndClubs();
  }, []);

  const selectEventDetails = async (event: ClubEvent) => {
    setSelectedEvent(event);
    setLoadingRegs(true);
    try {
      const response = await axios.get(`/api/events/${event.id}/registrations`);
      setRegistrations(response.data);
    } catch (err) {
      console.error("Failed to load registrations", err);
    } finally {
      setLoadingRegs(false);
    }
  };

  const handleRegisterEvent = async (eventId: number) => {
    try {
      await axios.post(`/api/events/${eventId}/register`);
      triggerToast("Successfully registered for this event!");
      fetchEventsAndClubs();
      if (selectedEvent?.id === eventId) {
        // Refresh detail view
        const eventObj = events.find(e => e.id === eventId);
        if (eventObj) selectEventDetails(eventObj);
      }
    } catch (err: any) {
      triggerToast(err.response?.data?.message || "Registration failed.");
    }
  };

  const handleCancelRegistration = async (eventId: number) => {
    try {
      await axios.post(`/api/events/${eventId}/cancel`);
      triggerToast("Your registration has been cancelled.");
      fetchEventsAndClubs();
      if (selectedEvent?.id === eventId) {
        const eventObj = events.find(e => e.id === eventId);
        if (eventObj) selectEventDetails(eventObj);
      }
    } catch (err: any) {
      triggerToast(err.response?.data?.message || "Failed to cancel registration.");
    }
  };

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetClubId || !eventTitle || !eventDesc || !eventDate || !eventTime || !eventLocation) return;
    setSubmittingEvent(true);
    try {
      await axios.post("/api/events", {
        clubId: parseInt(targetClubId),
        title: eventTitle,
        description: eventDesc,
        bannerUrl: eventBanner || "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&q=80&w=400",
        eventDate,
        eventTime,
        location: eventLocation
      });
      triggerToast(`Event "${eventTitle}" scheduled successfully!`);
      setShowCreateForm(false);
      setEventTitle("");
      setEventDesc("");
      setEventBanner("");
      setEventDate("");
      setEventTime("");
      setEventLocation("");
      fetchEventsAndClubs();
    } catch (err: any) {
      triggerToast(err.response?.data?.message || "Scheduling event failed.");
    } finally {
      setSubmittingEvent(false);
    }
  };

  const handleToggleAttendance = async (userId: number, currentAtt: boolean) => {
    if (!selectedEvent) return;
    try {
      await axios.post(`/api/events/${selectedEvent.id}/attendance`, {
        userId,
        attended: !currentAtt
      });
      // Refresh details
      selectEventDetails(selectedEvent);
    } catch (err) {
      triggerToast("Failed to update attendance.");
    }
  };

  const handleGenerateCertificates = async () => {
    if (!selectedEvent) return;
    try {
      const res = await axios.post(`/api/events/${selectedEvent.id}/generate-certificates`);
      triggerToast(res.data.message || "Certificates generated successfully!");
      selectEventDetails(selectedEvent);
    } catch (err: any) {
      triggerToast(err.response?.data?.message || "Failed to generate certificates.");
    }
  };

  const handleDeleteEvent = async (eventId: number) => {
    if (!window.confirm("Are you sure you want to cancel and delete this event entirely? All registered users will be removed.")) return;
    try {
      await axios.delete(`/api/events/${eventId}`);
      triggerToast("Event deleted successfully.");
      setSelectedEvent(null);
      fetchEventsAndClubs();
    } catch (err: any) {
      triggerToast("Failed to delete event.");
    }
  };

  // Helper checks
  const isManagerForSelected = selectedEvent && myClubs.some(c => c.id === selectedEvent.clubId);
  const isRegisteredForSelected = selectedEvent && registrations.some(r => r.userId === user?.id && r.status === "REGISTERED");

  return (
    <div className="space-y-6 animate-fade-in relative">
      {/* Toast Helper */}
      {toastMessage && (
        <div className="fixed top-4 right-4 bg-indigo-600 text-white font-mono text-xs px-4 py-3 rounded-xl shadow-2xl border border-indigo-500/30 z-50 flex items-center gap-2 animate-bounce-slow">
          <CheckCircle2 className="h-4 w-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-display font-bold text-xl text-white">Events Calendar</h2>
          <p className="text-xs text-slate-400">Secure registrations, check-in for hackathons, and download official certificates.</p>
        </div>
        {myClubs.length > 0 && (
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="self-start text-xs bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-lg font-medium transition-all flex items-center gap-2 shadow-md shadow-indigo-600/10 font-mono"
          >
            <Plus className="h-4 w-4" />
            {showCreateForm ? "Close Form" : "Schedule New Event"}
          </button>
        )}
      </div>

      {/* Create Event Form */}
      {showCreateForm && (
        <form onSubmit={handleCreateEvent} className="bg-[#16191f] border border-indigo-500/20 rounded-2xl p-6 space-y-4 animate-slide-up">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <Calendar className="h-4 w-4 text-indigo-400" />
            <h3 className="font-display font-bold text-sm text-white">Schedule New Campus Event</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-[10px] font-mono uppercase text-slate-400 mb-1">Select Sponsoring Club</label>
              <select
                value={targetClubId}
                onChange={(e) => setTargetClubId(e.target.value)}
                className="w-full px-3 py-2 bg-[#090a0c] border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-indigo-500"
              >
                {myClubs.map(club => (
                  <option key={club.id} value={club.id}>{club.name}</option>
                ))}
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-[10px] font-mono uppercase text-slate-400 mb-1">Event Title</label>
              <input
                type="text"
                required
                value={eventTitle}
                onChange={(e) => setEventTitle(e.target.value)}
                placeholder="e.g. HackSphere Hackathon"
                className="w-full px-3 py-2 bg-[#090a0c] border border-slate-800 rounded-lg text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-[10px] font-mono uppercase text-slate-400 mb-1">Event Date</label>
              <input
                type="date"
                required
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
                className="w-full px-3 py-2 bg-[#090a0c] border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
              />
            </div>
            <div>
              <label className="block text-[10px] font-mono uppercase text-slate-400 mb-1">Start Time</label>
              <input
                type="time"
                required
                value={eventTime}
                onChange={(e) => setEventTime(e.target.value)}
                className="w-full px-3 py-2 bg-[#090a0c] border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
              />
            </div>
            <div>
              <label className="block text-[10px] font-mono uppercase text-slate-400 mb-1">Location / Venue</label>
              <input
                type="text"
                required
                value={eventLocation}
                onChange={(e) => setEventLocation(e.target.value)}
                placeholder="e.g. Campus Lab 4"
                className="w-full px-3 py-2 bg-[#090a0c] border border-slate-800 rounded-lg text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-mono uppercase text-slate-400 mb-1">Banner Image URL (Optional)</label>
              <input
                type="url"
                value={eventBanner}
                onChange={(e) => setEventBanner(e.target.value)}
                placeholder="https://images.unsplash.com/photo-..."
                className="w-full px-3 py-2 bg-[#090a0c] border border-slate-800 rounded-lg text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 font-mono"
              />
            </div>
            <div>
              <label className="block text-[10px] font-mono uppercase text-slate-400 mb-1">Goal / Description</label>
              <input
                type="text"
                required
                value={eventDesc}
                onChange={(e) => setEventDesc(e.target.value)}
                placeholder="A brief overview of the agenda, topics covered, and perks."
                className="w-full px-3 py-2 bg-[#090a0c] border border-slate-800 rounded-lg text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
              />
            </div>
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
              disabled={submittingEvent}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-mono rounded-lg transition-colors flex items-center gap-1"
            >
              {submittingEvent ? <Loader2 className="h-3 w-3 animate-spin" /> : "Schedule Event"}
            </button>
          </div>
        </form>
      )}

      {/* Main split dashboard layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Events Listing */}
        <div className="lg:col-span-2 space-y-4">
          {loading ? (
            <div className="h-48 flex justify-center items-center">
              <Loader2 className="h-6 w-6 text-indigo-500 animate-spin" />
            </div>
          ) : error ? (
            <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl text-center text-xs text-rose-400 font-mono">
              {error}
            </div>
          ) : events.length === 0 ? (
            <div className="p-12 bg-[#16191f] border border-slate-800 rounded-2xl text-center">
              <Calendar className="h-8 w-8 text-slate-600 mx-auto mb-3" />
              <p className="text-xs text-slate-400 font-mono">No campus events currently scheduled.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {events.map(event => {
                const isMyClubSponsor = myClubs.some(c => c.id === event.clubId);
                return (
                  <div
                    key={event.id}
                    onClick={() => selectEventDetails(event)}
                    className={`p-4 bg-[#16191f] border rounded-2xl cursor-pointer hover:border-indigo-500/30 transition-all flex flex-col md:flex-row gap-4 ${
                      selectedEvent?.id === event.id ? "border-indigo-600" : "border-slate-800"
                    }`}
                  >
                    {/* Banner */}
                    <div className="w-full md:w-36 h-24 rounded-xl overflow-hidden bg-slate-900 shrink-0">
                      <img 
                        src={event.bannerUrl} 
                        alt={event.title} 
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&q=80&w=400";
                        }}
                      />
                    </div>

                    {/* Details content */}
                    <div className="flex-1 flex flex-col justify-between space-y-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[9px] font-mono uppercase bg-slate-900 border border-slate-800 text-slate-400 px-2 py-0.5 rounded">
                            {event.clubName}
                          </span>
                          {isMyClubSponsor && (
                            <span className="text-[9px] font-mono uppercase bg-indigo-600/10 text-indigo-400 px-2 py-0.5 rounded">
                              Manage
                            </span>
                          )}
                        </div>
                        <h3 className="font-display font-semibold text-white text-sm mt-1">{event.title}</h3>
                        <p className="text-slate-400 text-xs mt-1 line-clamp-1">{event.description}</p>
                      </div>

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[10px] font-mono text-slate-500 pt-1 border-t border-slate-800/60">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3 text-indigo-400" />
                          {new Date(event.eventDate).toLocaleDateString()}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3 text-indigo-400" />
                          {event.eventTime}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3 text-indigo-400" />
                          {event.location}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Selected Event Management & Self Registration */}
        <div className="lg:col-span-1">
          {selectedEvent ? (
            <div className="bg-[#16191f] border border-slate-800 rounded-2xl p-5 space-y-6 sticky top-24">
              
              {/* Event Overview Card */}
              <div className="space-y-3">
                <div className="h-24 w-full rounded-xl overflow-hidden bg-slate-900">
                  <img 
                    src={selectedEvent.bannerUrl} 
                    alt={selectedEvent.title} 
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&q=80&w=400";
                    }}
                  />
                </div>
                <div>
                  <span className="text-[9px] font-mono bg-indigo-500/10 text-indigo-400 px-2.5 py-0.5 rounded-full uppercase">
                    {selectedEvent.clubName} Event
                  </span>
                  <h3 className="font-display font-bold text-white text-base mt-2">{selectedEvent.title}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed mt-1">{selectedEvent.description}</p>
                </div>
                <div className="space-y-1 text-[10px] font-mono text-slate-500 pt-2 border-t border-slate-800/60">
                  <p className="flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5 text-indigo-400" /> Date: <span className="text-slate-300">{new Date(selectedEvent.eventDate).toLocaleDateString()}</span></p>
                  <p className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5 text-indigo-400" /> Time: <span className="text-slate-300">{selectedEvent.eventTime}</span></p>
                  <p className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5 text-indigo-400" /> Venue: <span className="text-slate-300">{selectedEvent.location}</span></p>
                </div>
              </div>

              {/* Student Self-Registration panel */}
              <div className="pt-4 border-t border-slate-800/80 space-y-3">
                {isRegisteredForSelected ? (
                  <div className="space-y-2">
                    <div className="p-3 bg-emerald-500/5 rounded-xl border border-emerald-500/20 text-center text-xs text-emerald-400 font-mono flex items-center justify-center gap-1.5">
                      <Check className="h-4 w-4" /> You are registered for this event
                    </div>
                    <button
                      onClick={() => handleCancelRegistration(selectedEvent.id)}
                      className="w-full py-1.5 bg-[#090a0c] hover:bg-rose-900 border border-slate-800 hover:border-rose-700 hover:text-white text-slate-400 text-xs font-mono rounded-lg transition-all"
                    >
                      Cancel Registration
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => handleRegisterEvent(selectedEvent.id)}
                    className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-mono rounded-lg transition-all flex items-center justify-center gap-1.5 shadow-md shadow-indigo-600/10"
                  >
                    <ShieldCheck className="h-4 w-4" />
                    Register for Event
                  </button>
                )}
              </div>

              {/* Manager Console Section */}
              {isManagerForSelected && (
                <div className="pt-4 border-t border-slate-800/80 space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-[10px] font-mono uppercase text-indigo-400 tracking-wider">Manager Console</h4>
                    <button
                      onClick={() => handleDeleteEvent(selectedEvent.id)}
                      className="text-[10px] text-rose-500 hover:text-rose-400 hover:underline flex items-center gap-0.5 font-mono"
                    >
                      <Trash2 className="h-3 w-3" /> Cancel Event
                    </button>
                  </div>

                  {/* Registered Attendees and check-ins */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-[10px] font-mono text-slate-500">
                      <span>Attendee Directory ({registrations.length})</span>
                      <span className="text-emerald-400">Attended Check-in</span>
                    </div>

                    {loadingRegs ? (
                      <div className="py-4 text-center">
                        <Loader2 className="h-4 w-4 animate-spin text-indigo-500 mx-auto" />
                      </div>
                    ) : registrations.length === 0 ? (
                      <p className="text-[9px] font-mono text-slate-600 text-center py-3 border border-dashed border-slate-800 rounded">
                        No students registered yet.
                      </p>
                    ) : (
                      <div className="max-h-40 overflow-y-auto space-y-1.5 pr-1">
                        {registrations.map(reg => (
                          <div key={reg.id} className="p-2 rounded bg-[#090a0c] border border-slate-850 flex items-center justify-between text-[10px] font-mono">
                            <div>
                              <p className="text-slate-300 font-bold">{reg.user?.firstName} {reg.user?.lastName}</p>
                              <p className="text-[8px] text-slate-500">{reg.user?.username}</p>
                            </div>
                            <button
                              onClick={() => handleToggleAttendance(reg.userId, reg.attended)}
                              className={`p-1 px-2.5 rounded font-mono text-[9px] border transition-all ${
                                reg.attended 
                                ? "bg-emerald-600/20 border-emerald-500 text-emerald-400" 
                                : "bg-slate-900 border-slate-800 text-slate-500 hover:text-slate-300"
                              }`}
                            >
                              {reg.attended ? "✓ Checked" : "Mark Present"}
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Certificate Generation block */}
                  <div className="pt-2">
                    <button
                      onClick={handleGenerateCertificates}
                      className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-mono rounded-lg transition-all flex items-center justify-center gap-1.5"
                    >
                      <Award className="h-4 w-4" />
                      Generate Attendee Certificates
                    </button>
                    <p className="text-[8px] font-mono text-slate-500 mt-1 text-center leading-relaxed">
                      This will automatically generate official Certificate credentials only for users marked as Checked-in.
                    </p>
                  </div>

                </div>
              )}

            </div>
          ) : (
            <div className="bg-[#16191f] border border-slate-800 rounded-2xl p-6 text-center text-xs text-slate-500 font-mono py-12 sticky top-24">
              <Calendar className="h-8 w-8 text-slate-600 mx-auto mb-3" />
              Click any scheduled event on the left to register, or if you are a club organizer, manage attendance check-ins and issue credentials.
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
