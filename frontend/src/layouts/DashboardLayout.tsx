import { useState, useEffect } from "react";
import { ReactNode } from "react";
import { sidebarMenu,  sidebarMenuUser, sidebarProfile } from "@/data/dashboard-data.tsx"
import { LogoutCurve } from "iconsax-react";
interface DashboardLayoutProps {
    children: ReactNode;
}


const DashboardLayout = ({ children }: DashboardLayoutProps) => {
      // const admin = true;
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {

        const userRole = localStorage.getItem("userRole");
        setIsAdmin(userRole === "admin")

    }, []);

    const handleLogout = () => {
        localStorage.removeItem("userRole"); // Remove user role from localStorage
        window.location.href = "/"; // Redirect to Sign In page
    }

    const menuItems = isAdmin ? sidebarMenu : sidebarMenuUser; // Choose menu based on role

    return (
        <div className="flex min-h-screen">
            <aside className="min-w-[340px] p-7  bg-[#CCE5FE] flex flex-col justify-between">
                <div className="flex flex-col items-center w-full gap-5">
                    {/* Logo */}
                    <img src="./src/assets/logo.webp" alt="" className="max-w-[62px] max-h-[62px]"/>
                    {/* Profile section */}
                    <div className="flex w-full gap-8">
                        <div className="w-[92px] h-[92px] overflow-hidden border-black rounded-full border-[2px]">
                            <img src={sidebarProfile.img} alt="Profile" className="object-cover w-full h-full" />
                        </div>
                        <div className="flex flex-col justify-center text-lg text-[#4E4E53]">
                            <p>{sidebarProfile.name}</p>
                            <p>{sidebarProfile.position}</p>
                        </div>
                    </div>
                    {/* Util Icons */}
                    <div className="flex flex-col w-full">
                        {menuItems.map((item, index) => (
                            <div key={index} className="flex items-center w-full h-[59px] gap-3">
                                <span className="drop-shadow-[0_4px_2px_rgba(0,0,0,25%)]">{item.icon}</span>
                                <a href={item.path} className="text-[#504E53]">{item.name}</a>
                            </div>
                        ))}
                    </div>
                </div>
                <button 
                    className="flex justify-start shadow-none h-[59px] p-0 w-full items-center gap-3"
                    onClick={handleLogout}
                    >
                    <span className="drop-shadow-[0_4px_2px_rgba(0,0,0,25%)]">
                        <LogoutCurve size="27" color="#05668D" />
                    </span>
                    <p className="text-[#504E53]">Log-out</p>
                </button>
            </aside>
            <main className="flex-grow p-5 max-h-screen overflow-auto">{children}</main>
        </div>
    );
};

export default DashboardLayout;
