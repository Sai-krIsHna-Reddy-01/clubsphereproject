import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Shield, Key, Mail, User as UserIcon, Loader2 } from "lucide-react";

export const LoginView: React.FC = () => {
  const { login, register } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  
  // Login form state
  const [loginUsername, setLoginUsername] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  
  // Register form state
  const [regUsername, setRegUsername] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regFirstName, setRegFirstName] = useState("");
  const [regLastName, setRegLastName] = useState("");
  const [regRole, setRegRole] = useState("ROLE_STUDENT");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginUsername || !loginPassword) return;
    setError(null);
    setLoading(true);
    try {
      await login(loginUsername, loginPassword);
    } catch (err: any) {
      setError(err.response?.data?.message || "Invalid credentials. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    if (!regUsername || !regPassword || !regEmail || !regFirstName || !regLastName) {
      setError("Please fill out all fields.");
      return;
    }
    setLoading(true);
    try {
      await register({
        username: regUsername,
        password: regPassword,
        email: regEmail,
        firstName: regFirstName,
        lastName: regLastName,
        role: regRole,
      });
      setSuccess("Account created successfully! You can now log in.");
      setIsRegister(false);
      setLoginUsername(regUsername);
      setLoginPassword(regPassword);
    } catch (err: any) {
      setError(err.response?.data?.message || "Registration failed. Try a different username or email.");
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="min-h-screen bg-[#090a0c] text-slate-300 flex items-center justify-center p-4 selection:bg-indigo-600 selection:text-white">
      <div className="w-full max-w-md bg-[#111318]/90 border border-slate-800 rounded-2xl p-8 shadow-2xl relative overflow-hidden backdrop-blur-xl">
        {/* Visual blur highlights */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-emerald-600/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col items-center text-center mb-8 relative z-10">
          <div className="bg-indigo-600 p-3 rounded-2xl shadow-xl shadow-indigo-600/20 mb-4 animate-bounce-slow">
            <Shield className="h-7 w-7 text-white" />
          </div>
          <h1 className="font-display font-bold text-2xl text-white tracking-tight">ClubSphere</h1>
          <p className="text-xs text-slate-500 mt-1 max-w-xs">
            Student Clubs & Event Collaboration Platform
          </p>
        </div>

        {error && (
          <div className="p-3 mb-4 text-xs bg-rose-500/10 text-rose-400 border border-rose-500/20 rounded-lg font-mono">
            {error}
          </div>
        )}

        {success && (
          <div className="p-3 mb-4 text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-lg font-mono">
            {success}
          </div>
        )}

        {/* Form Container */}
        <div className="relative z-10">
          {!isRegister ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-mono uppercase text-slate-400 mb-1">Username</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                    <UserIcon className="h-4 w-4" />
                  </span>
                  <input
                    type="text"
                    required
                    value={loginUsername}
                    onChange={(e) => setLoginUsername(e.target.value)}
                    placeholder="student_bob or admin"
                    className="w-full pl-10 pr-4 py-2 bg-[#16191f] border border-slate-800 rounded-lg text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-slate-400 mb-1">Password</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                    <Key className="h-4 w-4" />
                  </span>
                  <input
                    type="password"
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-2 bg-[#16191f] border border-slate-800 rounded-lg text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 rounded-lg text-sm transition-all duration-200 flex items-center justify-center gap-2 mt-6 shadow-lg shadow-indigo-600/10"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Sign In"}
              </button>

              <div className="text-center mt-4">
                <button
                  type="button"
                  onClick={() => {
                    setIsRegister(true);
                    setError(null);
                  }}
                  className="text-xs text-indigo-400 hover:text-indigo-300 hover:underline"
                >
                  Don't have an account? Sign Up
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-mono uppercase text-slate-400 mb-1">First Name</label>
                  <input
                    type="text"
                    required
                    value={regFirstName}
                    onChange={(e) => setRegFirstName(e.target.value)}
                    placeholder="John"
                    className="w-full px-3 py-1.5 bg-[#16191f] border border-slate-800 rounded-lg text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono uppercase text-slate-400 mb-1">Last Name</label>
                  <input
                    type="text"
                    required
                    value={regLastName}
                    onChange={(e) => setRegLastName(e.target.value)}
                    placeholder="Doe"
                    className="w-full px-3 py-1.5 bg-[#16191f] border border-slate-800 rounded-lg text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-mono uppercase text-slate-400 mb-1">Email Address</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                    <Mail className="h-3.5 w-3.5" />
                  </span>
                  <input
                    type="email"
                    required
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="john@example.com"
                    className="w-full pl-9 pr-3 py-1.5 bg-[#16191f] border border-slate-800 rounded-lg text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-mono uppercase text-slate-400 mb-1">Username</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                    <UserIcon className="h-3.5 w-3.5" />
                  </span>
                  <input
                    type="text"
                    required
                    value={regUsername}
                    onChange={(e) => setRegUsername(e.target.value)}
                    placeholder="john_doe"
                    className="w-full pl-9 pr-3 py-1.5 bg-[#16191f] border border-slate-800 rounded-lg text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-mono uppercase text-slate-400 mb-1">Password</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                    <Key className="h-3.5 w-3.5" />
                  </span>
                  <input
                    type="password"
                    required
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-3 py-1.5 bg-[#16191f] border border-slate-800 rounded-lg text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-mono uppercase text-slate-400 mb-1">Desired Platform Role</label>
                <select
                  value={regRole}
                  onChange={(e) => setRegRole(e.target.value)}
                  className="w-full px-3 py-1.5 bg-[#16191f] border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-indigo-500 transition-colors"
                >
                  <option value="ROLE_STUDENT">Student (Browse & Join Clubs)</option>
                  <option value="ROLE_CLUB_MANAGER">Club Manager (Schedule Events / Approve members)</option>
                </select>
              </div>

                            <button
                type="submit"
                disabled={loading}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 rounded-lg text-sm transition-all duration-200 flex items-center justify-center gap-2 mt-4 shadow-lg shadow-indigo-600/10"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Create Account"
                )}
              </button>

              <div className="text-center mt-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsRegister(false);
                    setError(null);
                  }}
                  className="text-xs text-indigo-400 hover:text-indigo-300 hover:underline"
                >
                  Already have an account? Sign In
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoginView;