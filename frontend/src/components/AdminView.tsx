import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { ActivityLog, User } from "../types";
import { ShieldAlert, Terminal, Users, Key, Globe, Loader2, RefreshCw } from "lucide-react";

export const AdminView: React.FC = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadingLogs, setLoadingLogs] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Tabs inside admin console
  const [activeTab, setActiveTab] = useState<"users" | "logs">("users");

  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const response = await axios.get("/api/admin/users");
      setUsers(response.data);
      setError(null);
    } catch (err) {
      console.error("Failed to load users", err);
      setError("Failed to fetch user directory. Admin privileges required.");
    } finally {
      setLoadingUsers(false);
    }
  };

  const fetchLogs = async () => {
    setLoadingLogs(true);
    try {
      const response = await axios.get("/api/admin/logs");
      setLogs(response.data);
    } catch (err) {
      console.error("Failed to load activity logs", err);
    } finally {
      setLoadingLogs(false);
    }
  };

  const handleRoleChange = async (userId: number, roleName: string) => {
    try {
      await axios.put(`/api/admin/users/${userId}/role`, { roleName });
      fetchUsers();
      fetchLogs();
    } catch (err) {
      console.error("Failed to change user role", err);
    }
  };

  useEffect(() => {
    if (currentUser?.role === "ROLE_ADMIN") {
      fetchUsers();
      fetchLogs();
    }
  }, [currentUser]);

  if (currentUser?.role !== "ROLE_ADMIN") {
    return (
      <div className="max-w-md mx-auto text-center p-12 bg-rose-500/10 border border-rose-500/20 rounded-2xl my-12 space-y-4">
        <ShieldAlert className="h-10 w-10 text-rose-500 mx-auto" />
        <h3 className="font-display font-bold text-white text-base">Access Denied</h3>
        <p className="text-xs text-slate-400">This management dashboard is restricted to System Administrators. Your role context does not authorize database audit streams.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-display font-bold text-xl text-white">Administration Console</h2>
          <p className="text-xs text-slate-400">Promote student operators, verify global ledger status, and audit active network queries.</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => {
              fetchUsers();
              fetchLogs();
            }}
            className="p-2 bg-[#16191f] text-slate-400 hover:text-white border border-slate-800 rounded-lg transition-colors flex items-center gap-1 text-xs font-mono"
            title="Refresh logs & users"
          >
            <RefreshCw className="h-4 w-4" /> Refresh System
          </button>
        </div>
      </div>

      {/* Selector Tabs */}
      <div className="flex border-b border-slate-800">
        <button
          onClick={() => setActiveTab("users")}
          className={`pb-3 px-6 font-display font-medium text-xs transition-all border-b-2 ${
            activeTab === 'users' ? 'border-indigo-500 text-white' : 'border-transparent text-slate-500 hover:text-white'
          }`}
        >
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4" /> User Management
          </div>
        </button>
        <button
          onClick={() => setActiveTab("logs")}
          className={`pb-3 px-6 font-display font-medium text-xs transition-all border-b-2 ${
            activeTab === 'logs' ? 'border-indigo-500 text-white' : 'border-transparent text-slate-500 hover:text-white'
          }`}
        >
          <div className="flex items-center gap-2">
            <Terminal className="h-4 w-4" /> Security Audit Log
          </div>
        </button>
      </div>

      {error && (
        <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-mono rounded-lg">
          {error}
        </div>
      )}

      {/* Tab Panels */}
      {activeTab === "users" ? (
        <div className="bg-[#16191f] border border-slate-800 rounded-2xl p-6 overflow-x-auto">
          {loadingUsers ? (
            <div className="py-12 flex justify-center items-center">
              <Loader2 className="h-6 w-6 text-indigo-500 animate-spin" />
            </div>
          ) : (
            <table className="w-full text-left font-mono text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-500 pb-2">
                  <th className="py-3 px-2">ID</th>
                  <th className="py-3 px-2">Username</th>
                  <th className="py-3 px-2">Full Name</th>
                  <th className="py-3 px-2">Email</th>
                  <th className="py-3 px-2 text-right">Role Authority</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-850">
                {users.map(u => (
                  <tr key={u.id} className="text-slate-300 hover:bg-[#090a0c]/40 transition-colors">
                    <td className="py-3 px-2 text-slate-500 font-bold">{u.id}</td>
                    <td className="py-3 px-2 text-white font-medium">{u.username}</td>
                    <td className="py-3 px-2 text-slate-400">{u.firstName} {u.lastName}</td>
                    <td className="py-3 px-2 text-slate-500">{u.email}</td>
                    <td className="py-3 px-2 text-right">
                      {u.id === currentUser.id ? (
                        <span className="text-[10px] bg-indigo-500/20 text-indigo-400 px-2.5 py-1 rounded font-bold uppercase">
                          👑 SYSTEM ADMIN
                        </span>
                      ) : (
                        <select
                          value={u.role}
                          onChange={(e) => handleRoleChange(u.id, e.target.value)}
                          className="px-2.5 py-1 bg-[#090a0c] border border-slate-800 rounded font-bold text-[10px] uppercase text-indigo-400 focus:outline-none focus:border-indigo-500"
                        >
                          <option value="ROLE_STUDENT">Student Operator</option>
                          <option value="ROLE_CLUB_MANAGER">Club Manager</option>
                        </select>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      ) : (
        <div className="bg-[#16191f] border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center gap-2 text-slate-400 font-mono text-xs">
            <Globe className="h-4 w-4 text-emerald-400" />
            <span>Active Transaction Log Stream (backed by mock ledger)</span>
          </div>

          <div className="bg-[#090a0c] border border-slate-800 rounded-xl p-4 font-mono text-[10px] text-indigo-400/90 max-h-96 overflow-y-auto space-y-2 select-text">
            {loadingLogs ? (
              <div className="py-8 text-center">
                <Loader2 className="h-4 w-4 animate-spin text-indigo-500 mx-auto" />
              </div>
            ) : logs.length === 0 ? (
              <p className="text-slate-600 text-center py-4">Audit log stream empty.</p>
            ) : (
              logs.map(log => (
                <div key={log.id} className="flex flex-col sm:flex-row justify-between sm:items-center py-1 border-b border-slate-850 pb-1.5 last:border-b-0">
                  <div className="space-y-0.5">
                    <span className="text-slate-500">[{new Date(log.timestamp).toLocaleTimeString()}]</span>{" "}
                    <span className="text-emerald-400">@{log.username || "System"}</span>:{" "}
                    <span className="text-slate-300">{log.action}</span>
                  </div>
                  <span className="text-slate-600 text-[9px] self-start sm:self-auto">IP: {log.ipAddress}</span>
                </div>
              ))
            )}
          </div>
        </div>
      )}

    </div>
  );
};
