import React, { useState, useEffect, useRef } from "react";
import { ReactNode } from "react";
import { useAuthStore } from "@/store/authStore";
import { sidebarMenu, sidebarMenuUser } from "@/data/dashboard-data.tsx";
// import { LogoutCurve, DocumentUpload } from "iconsax-react";
// import { HiMiniChevronDoubleLeft } from "react-icons/hi2";
import { usePositionStore } from "@/store/positionStore";
import { useImageUploadStore } from "@/store/imageUploadStore";
import { useUpdateUserStore } from "@/store/userStore";

// Lucide Icons
import {
  LogOut,
  Menu,
  X,
} from "lucide-react";

interface DashboardLayoutProps {
  children: ReactNode;
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const { user, logout: handleLogout } = useAuthStore();
  const { profile_picture, fetchUserProfile } = useUpdateUserStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1024);
  const isAdmin = user?.role === "admin";
  const { userPosition, fetchUserPosition } = usePositionStore();
  const { uploadImage } = useImageUploadStore();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const menuItems = isAdmin ? sidebarMenu : sidebarMenuUser;

  const capitalize = (str: string): string =>
    str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      console.log(selectedFile);
      
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
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
            <div className="flex justify-center items-center gap-3 p-6 border-b border-gray-200/50">
                <img src="./src/assets/logo.webp" alt="" className="max-w-[62px] max-h-[62px]" />
                <button
                    onClick={() => setSidebarOpen(false)}
                    className="ml-auto lg:hidden p-1 rounded-lg hover:bg-gray-100 transition-colors"
                >
                    <X className="w-5 h-5" />
                </button>
            </div>

            {/* Profile Upload Section */}
            <div className="p-6 border-b border-gray-200/50">
                <div className="flex items-center gap-3">
                    <div 
                    className="relative w-12 h-12 overflow-hidden rounded-full bg-gradient-to-r from-pink-400 to-purple-500 flex items-center justify-center cursor-pointer group"
                    onClick={() => fileInputRef.current?.click()}
                    >
                    {profile_picture ? (
                        <img src={profile_picture} alt="Profile" className="object-cover w-full h-full" />
                    ) : (
                        <span className="text-white font-semibold text-sm">
                        {user?.first_name?.charAt(0) || "U"}
                        {user?.last_name?.charAt(0) || ""}
                        </span>
                    )}
                    
                    {/* Pen Overlay on Hover */}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-200">
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
                    <p className="text-sm text-gray-500">{userPosition?.position_name ?? ""}</p>
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
                    </span>

                    <span className="font-medium">{item.name}</span>
                    </a>
                ))}
            </nav>

            {/* Logout */}
            <div className="p-4 border-t border-gray-200/50">
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-red-50 hover:text-red-600 rounded-xl transition-all duration-200"
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
                <div className="lg:hidden bg-white/80 backdrop-blur-xl border-b border-gray-200/50 p-4">
                <button
                    onClick={() => setSidebarOpen(true)}
                    className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                    <Menu className="w-6 h-6" />
                </button>
                </div>
            )}

            <div className="p-6 lg:p-8">
                {children}
            </div>
        </main>
    </div>
  );
};

export default DashboardLayout;