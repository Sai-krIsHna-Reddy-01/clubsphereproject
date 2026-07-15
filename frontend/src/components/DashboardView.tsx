import React, { useState, useEffect } from "react";
import axios from "axios";
import { DashboardStats } from "../types";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
  AreaChart, Area, PieChart, Pie, Cell 
} from "recharts";
import { Layers, Calendar, Users, Award, TrendingUp, Sparkles, AlertCircle, Loader2 } from "lucide-react";

const COLORS = ["#6366f1", "#10b981", "#f59e0b", "#ec4899", "#8b5cf6", "#3b82f6"];

export const DashboardView: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const response = await axios.get("/api/dashboard/stats");
      setStats(response.data);
      setError(null);
    } catch (err) {
      console.error("Failed to fetch dashboard stats", err);
      setError("Failed to retrieve real-time analytics data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="h-96 flex flex-col items-center justify-center gap-3">
        <Loader2 className="h-8 w-8 text-indigo-500 animate-spin" />
        <p className="text-xs text-slate-500 font-mono">Aggregating campus records and audit streams...</p>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-6 text-center max-w-md mx-auto my-12">
        <AlertCircle className="h-8 w-8 text-rose-500 mx-auto mb-3" />
        <p className="text-sm text-slate-300 font-medium mb-4">{error || "No stats data found"}</p>
        <button 
          onClick={fetchStats}
          className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-mono rounded-lg transition-colors"
        >
          Retry Fetch
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 bg-gradient-to-r from-indigo-950/20 to-slate-900/40 border border-slate-800/80 rounded-2xl">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-indigo-400" />
            <span className="text-[10px] font-mono uppercase text-indigo-400 font-bold">Collaborative Intelligence</span>
          </div>
          <h2 className="font-display font-bold text-xl text-white mt-1">Platform Analytics Dashboard</h2>
          <p className="text-xs text-slate-400 mt-0.5">Real-time health report of active college clubs, events participation, and certificate generation.</p>
        </div>
        <div className="text-right">
          <span className="text-[10px] font-mono text-slate-500 block">LAST REFRESHED</span>
          <span className="text-xs font-mono text-indigo-400 font-medium">{new Date().toLocaleTimeString()}</span>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1 */}
        <div className="bg-[#16191f] border border-slate-800 rounded-2xl p-5 hover:border-indigo-500/30 transition-all duration-300 group">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[11px] font-mono uppercase text-slate-500 tracking-wider">Approved Clubs</p>
              <h3 className="text-3xl font-display font-bold text-white mt-1.5 group-hover:text-indigo-400 transition-colors">
                {stats.totalClubs}
              </h3>
            </div>
            <div className="p-2.5 bg-indigo-500/10 text-indigo-400 rounded-xl group-hover:scale-105 transition-transform">
              <Layers className="h-5 w-5" />
            </div>
          </div>
          <p className="text-[10px] text-slate-500 mt-3 font-mono">
            Active verified student groups
          </p>
        </div>

        {/* KPI 2 */}
        <div className="bg-[#16191f] border border-slate-800 rounded-2xl p-5 hover:border-emerald-500/30 transition-all duration-300 group">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[11px] font-mono uppercase text-slate-500 tracking-wider">Scheduled Events</p>
              <h3 className="text-3xl font-display font-bold text-white mt-1.5 group-hover:text-emerald-400 transition-colors">
                {stats.totalEvents}
              </h3>
            </div>
            <div className="p-2.5 bg-emerald-500/10 text-emerald-400 rounded-xl group-hover:scale-105 transition-transform">
              <Calendar className="h-5 w-5" />
            </div>
          </div>
          <p className="text-[10px] text-slate-500 mt-3 font-mono">
            Hackathons, pitches & assemblies
          </p>
        </div>

        {/* KPI 3 */}
        <div className="bg-[#16191f] border border-slate-800 rounded-2xl p-5 hover:border-amber-500/30 transition-all duration-300 group">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[11px] font-mono uppercase text-slate-500 tracking-wider">Registered Students</p>
              <h3 className="text-3xl font-display font-bold text-white mt-1.5 group-hover:text-amber-400 transition-colors">
                {stats.totalStudents}
              </h3>
            </div>
            <div className="p-2.5 bg-amber-500/10 text-amber-400 rounded-xl group-hover:scale-105 transition-transform">
              <Users className="h-5 w-5" />
            </div>
          </div>
          <p className="text-[10px] text-slate-500 mt-3 font-mono">
            Enrolled platform members
          </p>
        </div>

        {/* KPI 4 */}
        <div className="bg-[#16191f] border border-slate-800 rounded-2xl p-5 hover:border-indigo-500/30 transition-all duration-300 group">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[11px] font-mono uppercase text-slate-500 tracking-wider">Registrations</p>
              <h3 className="text-3xl font-display font-bold text-white mt-1.5 group-hover:text-indigo-400 transition-colors">
                {stats.totalRegistrations}
              </h3>
            </div>
            <div className="p-2.5 bg-indigo-500/10 text-indigo-400 rounded-xl group-hover:scale-105 transition-transform">
              <Award className="h-5 w-5" />
            </div>
          </div>
          <p className="text-[10px] text-slate-500 mt-3 font-mono">
            Active attendees logged
          </p>
        </div>
      </div>

      {/* Recharts Graphical Visualizations Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Area Chart - Monthly Events Scheduled */}
        <div className="bg-[#16191f] border border-slate-800 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-indigo-400" />
              <h4 className="font-display font-semibold text-sm text-white">Monthly Event Velocity</h4>
            </div>
            <span className="text-[9px] font-mono bg-slate-900 border border-slate-800 text-slate-400 px-2 py-0.5 rounded">
              Trend Metrics
            </span>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.monthlyEvents} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="name" stroke="#64748b" style={{ fontSize: "10px", fontFamily: "JetBrains Mono" }} />
                <YAxis stroke="#64748b" style={{ fontSize: "10px", fontFamily: "JetBrains Mono" }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: "#111318", border: "1px solid #334155", borderRadius: "8px" }}
                  labelStyle={{ color: "#94a3b8", fontFamily: "Space Grotesk", fontWeight: "bold" }}
                  itemStyle={{ color: "#6366f1", fontFamily: "JetBrains Mono", fontSize: "12px" }}
                />
                <Area type="monotone" dataKey="count" name="Events Scheduled" stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#colorCount)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Bar Chart - Active Club Scores */}
        <div className="bg-[#16191f] border border-slate-800 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Award className="h-4 w-4 text-emerald-400" />
              <h4 className="font-display font-semibold text-sm text-white">Most Active Verified Clubs</h4>
            </div>
            <span className="text-[9px] font-mono bg-slate-900 border border-slate-800 text-slate-400 px-2 py-0.5 rounded">
              Registrations count
            </span>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.mostActiveClubs} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="name" stroke="#64748b" style={{ fontSize: "10px", fontFamily: "JetBrains Mono" }} tickFormatter={(val) => val.split(' ')[0]} />
                <YAxis stroke="#64748b" style={{ fontSize: "10px", fontFamily: "JetBrains Mono" }} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#111318", border: "1px solid #334155", borderRadius: "8px" }}
                  labelStyle={{ color: "#94a3b8", fontFamily: "Space Grotesk" }}
                  itemStyle={{ color: "#10b981", fontFamily: "JetBrains Mono", fontSize: "12px" }}
                />
                <Bar dataKey="score" name="Participations Logged" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 3: Line Chart - Cumulative Club Registration Growth */}
        <div className="bg-[#16191f] border border-slate-800 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-amber-400" />
              <h4 className="font-display font-semibold text-sm text-white">Cumulative Club Count Growth</h4>
            </div>
            <span className="text-[9px] font-mono bg-slate-900 border border-slate-800 text-slate-400 px-2 py-0.5 rounded">
              Growth Trajectory
            </span>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.clubGrowth} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorClubs" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="name" stroke="#64748b" style={{ fontSize: "10px", fontFamily: "JetBrains Mono" }} />
                <YAxis stroke="#64748b" style={{ fontSize: "10px", fontFamily: "JetBrains Mono" }} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#111318", border: "1px solid #334155", borderRadius: "8px" }}
                  labelStyle={{ color: "#94a3b8", fontFamily: "Space Grotesk" }}
                  itemStyle={{ color: "#f59e0b", fontFamily: "JetBrains Mono", fontSize: "12px" }}
                />
                <Area type="monotone" dataKey="clubs" name="Verified Clubs" stroke="#f59e0b" strokeWidth={2} fillOpacity={1} fill="url(#colorClubs)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 4: Pie Chart - Club Category Distribution */}
        <div className="bg-[#16191f] border border-slate-800 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Layers className="h-4 w-4 text-pink-400" />
              <h4 className="font-display font-semibold text-sm text-white">Participation By Club Type</h4>
            </div>
            <span className="text-[9px] font-mono bg-slate-900 border border-slate-800 text-slate-400 px-2 py-0.5 rounded">
              Composition
            </span>
          </div>
          <div className="h-72 flex flex-col sm:flex-row items-center justify-around gap-4">
            <div className="w-48 h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats.participationStats}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {stats.participationStats.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: "#111318", border: "1px solid #334155", borderRadius: "8px" }}
                    itemStyle={{ fontFamily: "JetBrains Mono", fontSize: "11px" }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-2">
              {stats.participationStats.map((entry, index) => (
                <div key={entry.name} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                  <span className="text-xs font-mono text-slate-400">{entry.name}</span>
                  <span className="text-xs font-mono font-bold text-white">({entry.value}%)</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
