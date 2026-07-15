import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import { User, UserRole } from "../types";

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  register: (userData: any) => Promise<boolean>;
  logout: () => void;
  updateProfile: (profileData: any) => Promise<boolean>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Initialize Auth State from localStorage
  useEffect(() => {
    const storedToken = localStorage.getItem("clubsphere_token");
    const storedUser = localStorage.getItem("clubsphere_user");

    if (storedToken && storedUser) {
      setToken(storedToken);
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        
        // Configure Axios authorization header
        axios.defaults.headers.common["Authorization"] = `Bearer ${storedToken}`;
      } catch (e) {
        // Corrupted cache cleanup
        localStorage.removeItem("clubsphere_token");
        localStorage.removeItem("clubsphere_user");
      }
    }
    setLoading(false);
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      const response = await axios.post("/api/auth/login", { username, password });
      const { token: receivedToken, user: receivedUser } = response.data;
      
      localStorage.setItem("clubsphere_token", receivedToken);
      localStorage.setItem("clubsphere_user", JSON.stringify(receivedUser));
      
      setToken(receivedToken);
      setUser(receivedUser);
      
      axios.defaults.headers.common["Authorization"] = `Bearer ${receivedToken}`;
      return true;
    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    }
  };

  const register = async (userData: any): Promise<boolean> => {
    try {
      const response = await axios.post("/api/auth/register", userData);
      const { token: receivedToken, user: receivedUser } = response.data || {};
      
      if (receivedToken && receivedUser) {
        localStorage.setItem("clubsphere_token", receivedToken);
        localStorage.setItem("clubsphere_user", JSON.stringify(receivedUser));
        
        setToken(receivedToken);
        setUser(receivedUser);
        
        axios.defaults.headers.common["Authorization"] = `Bearer ${receivedToken}`;
      }
      return true;
    } catch (error) {
      console.error("Registration failed:", error);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem("clubsphere_token");
    localStorage.removeItem("clubsphere_user");
    setToken(null);
    setUser(null);
    delete axios.defaults.headers.common["Authorization"];
  };

  const updateProfile = async (profileData: any): Promise<boolean> => {
    try {
      const response = await axios.put("/api/users/profile", profileData);
      const updatedUser = { ...user, ...response.data };
      
      // Keep local structures synced
      localStorage.setItem("clubsphere_user", JSON.stringify(updatedUser));
      setUser(updatedUser);
      return true;
    } catch (error) {
      console.error("Profile update failed:", error);
      throw error;
    }
  };

  const refreshProfile = async () => {
    if (!token) return;
    try {
      const response = await axios.get("/api/users/profile");
      const updatedUser = response.data;
      localStorage.setItem("clubsphere_user", JSON.stringify(updatedUser));
      setUser(updatedUser);
    } catch (error) {
      console.error("Failed to refresh user profile:", error);
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        logout();
      }
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, updateProfile, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
