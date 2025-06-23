import React, { useState, useEffect, useRef } from "react";
import { ReactNode } from "react";
import { useAuthStore } from "@/store/authStore";
import { sidebarMenu, sidebarMenuUser } from "@/data/dashboard-data.tsx";
import { usePositionStore } from "@/store/positionStore";
import { useImageUploadStore } from "@/store/imageUploadStore";
import { useUpdateUserStore } from "@/store/userStore";
import { leaveRequestStore } from '@/store/leaveRequestStore';
import { useOvertimeRequestStore } from '@/store/overtimeRequestStore.ts';
import { useUserStore } from '@/store/userlistStore.ts';
import { Toaster, toast } from 'react-hot-toast';
import { base_url } from '../config';
// Lucide Icons
import {
  LogOut,
  Menu,
  X,
} from "lucide-react";

interface DashboardLayoutProps {
  children: ReactNode;
}

interface SystemNotification {
  type: string;
  data: {
    status?: string;
    details?: string;
  };
  created_at: string;
}



const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const lastNotificationRef = useRef<string | null>(null);
  const { user, logout: handleLogout } = useAuthStore();
  const { profile_picture, position,  fetchUserProfile } = useUpdateUserStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1024);
  const isAdmin = user?.role === "admin";
  const { userPosition, fetchUserPosition } = usePositionStore();
  const { uploadImage } = useImageUploadStore();
  const [_selectedFile, setSelectedFile] = useState<File | undefined>();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const { leaveRequest  } = leaveRequestStore();
  const menuItems = isAdmin ? sidebarMenu : sidebarMenuUser;
  const leaveRequestCount = Array.isArray(leaveRequest) ? leaveRequest.length : 0;
  const count = useOvertimeRequestStore((state) => state.getPendingCount());
  const Userstore = useUserStore();
  const UnapprovedUsersCount = Userstore.newRegisteredUserCount;
  const capitalize = (str: string): string =>
    str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  
  

  const fetchLatestNotification = async () => {
    try {
      const response = await fetch(`${base_url}/get-system-logs/`);
      if (response.status === 204) return;

      if (!response.ok) return;

      const data: SystemNotification = await response.json();

      const identifier = `${data.type}-${data.created_at}`;
      if (identifier !== lastNotificationRef.current) {
        lastNotificationRef.current = identifier;

        console.log("testing Notification");
        

        const message = `${data.type.replace('_', ' ')} - ${data.data.status || ''} ${data.data.details || ''}`;

        toast(message);

        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification('System Notification', { body: message });
        }
      }
    } catch (error) {
      console.error('Failed to fetch latest notification:', error);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      setSelectedFile(file);
      if (user && typeof user.userId === "number") {
        try {
          await uploadImage(user.userId, file);
          await fetchUserProfile(user.userId);
        } catch (error) {
          console.error("Error uploading image or fetching profile:", error);
        }
      } else {
        console.warn("User ID is missing or not a number");
      }
    }
  };

  // Load user profile on mount
  useEffect(() => {
    const loadUserProfile = async () => {
      if (user.userId && !isNaN(Number(user.userId))) {
        fetchUserProfile(Number(user.userId));
      }
    };
    loadUserProfile();
  }, [fetchUserProfile, user, user.userId]);

  // Load user position
  useEffect(() => {
    const loadUserPosition = async () => {
      if (user?.position_id != null) {
        await fetchUserPosition(user.position_id);
      } else {
        console.warn("user.position_id is null or undefined");
      }
    };
    loadUserPosition();
  }, [fetchUserPosition, user, user?.position_id]);

  // Handle screen resize
  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 1024);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const user = useAuthStore.getState().user;
    if (user?.role !== "admin") return;

    let isFirst = true;
  
    const interval = setInterval(() => {
      if (isFirst) {
        isFirst = false; // Skip the first immediate run after mount
        return;
      }
  
      fetchLatestNotification(); // Fetch the latest notification every 5 seconds
    }, 5000);
  
    return () => clearInterval(interval); // Clear on component unmount
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
            className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm lg:hidden"
            onClick={() => setSidebarOpen(false)}
        />
    )}

      {/* Sidebar */}
    <aside
    className={`
    fixed top-0 left-0 z-50 w-64 h-full bg-white/80 backdrop-blur-xl border-r border-gray-200/50 shadow-xl
    transform transition-transform duration-300 ease-in-out
    ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
    `}
    >
        <div className="flex flex-col h-full">
            {/* Logo Section */}
            <div className="flex items-center justify-center gap-3 p-6 border-b border-gray-200/50">
                <img src="./src/assets/logo.webp" alt="" className="max-w-[62px] max-h-[62px]" />
                <button
                    onClick={() => setSidebarOpen(false)}
                    className="p-1 ml-auto transition-colors rounded-lg lg:hidden hover:bg-gray-100"
                >
                    <X className="w-5 h-5" />
                </button>
            </div>

            {/* Profile Upload Section */}
            <div className="p-6 border-b border-gray-200/50">
                <div className="flex items-center gap-3">
                    <div 
                    className="relative flex items-center justify-center w-12 h-12 overflow-hidden rounded-full cursor-pointer bg-gradient-to-r from-pink-400 to-purple-500 group"
                    onClick={() => fileInputRef.current?.click()}
                    >
                    {profile_picture ? (
                        <img src={profile_picture ?? ''} alt="Profile" className="object-cover w-full h-full" />
                    ) : (
                        <span className="text-sm font-semibold text-white">
                        {user?.first_name?.charAt(0) || "U"}
                        {user?.last_name?.charAt(0) || ""}
                        </span>
                    )}
                    
                    {/* Pen Overlay on Hover */}
                    <div className="absolute inset-0 flex items-center justify-center transition-opacity duration-200 opacity-0 bg-black/40 group-hover:opacity-100">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                        </svg>
                    </div>
                    </div>

                    <div>
                    <h3 className="font-semibold text-gray-900">
                        {user?.first_name ? capitalize(user.first_name) : ""}{" "}
                        {user?.last_name ? capitalize(user.last_name) : ""}
                    </h3>
                    <p className="text-sm text-gray-500">{position ?? ""}</p>
                    </div>
                </div>

                {/* Hidden input for profile upload */}
                <input
                    type="file"
                    id="profile-upload"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileChange}
                    ref={fileInputRef}
                />
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-1">
                {menuItems.map((item, index) => (
                    <a
                    key={index}
                    href={item.path}
                    className={`
                        w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all duration-200
                        ${
                        location.pathname === item.path
                            ? "bg-gradient-to-r from-indigo-500 to-cyan-500 text-white shadow-lg shadow-indigo-500/25"
                            : "text-gray-600 hover:bg-gray-100/80 hover:text-gray-900"
                        }
                    `}
                    >
                    {/* ✅ Render icon directly */}
                    <span className="flex-shrink-0">
                        {item.icon}
                      {item.name === "Leave Request" && leaveRequestCount > 0 &&(
                        <span className="absolute top-[332px] right-[190px] bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full shadow-md">
                          {leaveRequestCount}
                        </span>
                      )}
                      {item.name === "Overtime" && count > 0 &&(
                        <span className="absolute top-[436px] right-[190px] bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full shadow-md">
                          {count}
                        </span>
                      )}
                      {item.name === "Users" && UnapprovedUsersCount > 0 && (
                        <span className="absolute top-[540px] right-[190px] bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full shadow-md">
                          {UnapprovedUsersCount}
                        </span>
                      )}
                    </span>

                    <span className="font-medium">{item.name}</span>
                    </a>
                ))}
            </nav>

            {/* Logout */}
            <div className="p-4 border-t border-gray-200/50">
                <button
                    onClick={handleLogout}
                    className="flex items-center w-full gap-3 px-4 py-3 text-gray-600 transition-all duration-200 hover:bg-red-50 hover:text-red-600 rounded-xl"
                >
                    <LogOut className="w-5 h-5" />
                    <span className="font-medium">Log-out</span>
                </button>
            </div>
        </div>
    </aside>

      {/* Main Content */}
        <main className="lg:ml-64">
            {/* Mobile Header */}
            {!isDesktop && !sidebarOpen && (
                <div className="p-4 border-b lg:hidden bg-white/80 backdrop-blur-xl border-gray-200/50">
                <button
                    onClick={() => setSidebarOpen(true)}
                    className="p-2 transition-colors rounded-lg hover:bg-gray-100"
                >
                    <Menu className="w-6 h-6" />
                </button>
                </div>
            )}

            <div className="p-6 lg:p-8">
                {children}
            </div>
        </main>

        <Toaster position="top-right" />

    </div>
  );
};

export default DashboardLayout;