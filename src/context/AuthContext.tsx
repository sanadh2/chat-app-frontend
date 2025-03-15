"use client";

import { createContext, useContext, useEffect, useState } from "react";
import axiosInstance from "@/utils/axiosInstance";
import { UserType } from "@/types/user";
import { useRouter } from "next/navigation";

type AuthContextType = {
  user: UserType | null;
  isAuthenticated: boolean;
  logout: () => void;
  fetchUser: () => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<UserType | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();
  const fetchUser = async () => {
    try {
      const res = await axiosInstance.get("/auth/me", {
        withCredentials: true,
      });
      setUser(res.data.user);
      setIsAuthenticated(true);
    } catch (error) {
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    await axiosInstance.post("/auth/logout");
    setUser(null);
  };

  useEffect(() => {
    fetchUser().then(() => router.push("/chat"));
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, isAuthenticated: !!user, logout, fetchUser }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};
