import { ReactNode, useState, useEffect } from "react";
import { useAuthStore } from '@/store/authStore';
import { sidebarMenu, sidebarMenuUser, sidebarProfile } from "@/data/dashboard-data.tsx";
import { LogoutCurve, HambergerMenu } from "iconsax-react";
import { HiMiniChevronDoubleLeft } from "react-icons/hi2";
interface DashboardLayoutProps {
    children: ReactNode;
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
    const { user, logout: handleLogout } = useAuthStore();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 768);
    const isAdmin = user?.role === "admin";

    const menuItems = isAdmin ? sidebarMenu : sidebarMenuUser;

    const capitalize = (str: string): string =>
        str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();

    // Handle screen resize
    useEffect(() => {
        const handleResize = () => {
            setIsDesktop(window.innerWidth >= 768);
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return (
        <div className="flex min-h-screen">
            {/* Mobile sidebar - visible only when toggled */}
            {!isDesktop && sidebarOpen && (
                <aside className="min-w-[340px] p-7 bg-[#CCE5FE] fixed h-screen z-10">
                    <button
                        className="absolute left-[20px] top-[20px]"
                        onClick={() => setSidebarOpen(false)}
                    >
                        <HiMiniChevronDoubleLeft className="text-[#504E53] text-[20px]"/>
                    </button>

                    <div className="flex flex-col justify-between h-full">
                        <div className="flex flex-col items-center w-full gap-5">
                            {/* Logo */}
                            <img src="./src/assets/logo.webp" alt="" className="max-w-[62px] max-h-[62px]" />

                            {/* Profile section */}
                            <div className="flex w-full gap-8">
                                <div className="w-[92px] h-[92px] overflow-hidden border-black rounded-full border-[2px]">
                                    <img src={sidebarProfile.img} alt="Profile" className="object-cover w-full h-full" />
                                </div>
                                <div className="flex flex-col justify-center text-lg text-[#4E4E53]">
                                    <p>
                                        {user?.first_name ? capitalize(user.first_name) : ''}{" "}
                                        {user?.last_name ? capitalize(user.last_name) : ''}
                                    </p>
                                    <p>{sidebarProfile.position}</p>
                                </div>
                            </div>

                            {/* Menu Items */}
                            <div className="flex flex-col w-full">
                                {menuItems.map((item, index) => (
                                    <div key={index} className="flex items-center w-full h-[59px] gap-3">
                                        <span className="drop-shadow-[0_4px_2px_rgba(0,0,0,25%)]">{item.icon}</span>
                                        <a href={item.path} className="text-[#504E53]">{item.name}</a>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Logout button */}
                        <button
                            className="flex justify-start shadow-none h-[59px] p-0 w-full items-center gap-3"
                            onClick={handleLogout}
                        >
                            <span className="drop-shadow-[0_4px_2px_rgba(0,0,0,25%)]">
                                <LogoutCurve size="27" color="#05668D" />
                            </span>
                            <p className="text-[#504E53]">Log-out</p>
                        </button>
                    </div>
                </aside>
            )}

            {/* Desktop sidebar */}
            {isDesktop && (
                <aside className="min-w-[340px] p-7 bg-[#CCE5FE] sticky h-screen">
                    <div className="flex flex-col justify-between h-full">
                        <div className="flex flex-col items-center w-full gap-5">
                            {/* Logo */}
                            <img src="./src/assets/logo.webp" alt="" className="max-w-[62px] max-h-[62px]" />

                            {/* Profile section */}
                            <div className="flex w-full gap-8">
                                <div className="w-[92px] h-[92px] overflow-hidden border-black rounded-full border-[2px]">
                                    <img src={sidebarProfile.img} alt="Profile" className="object-cover w-full h-full" />
                                </div>
                                <div className="flex flex-col justify-center text-lg text-[#4E4E53]">
                                    <p>
                                        {user?.first_name ? capitalize(user.first_name) : ''}{" "}
                                        {user?.last_name ? capitalize(user.last_name) : ''}
                                    </p>
                                    <p>{sidebarProfile.position}</p>
                                </div>
                            </div>

                            {/* Menu Items */}
                            <div className="flex flex-col w-full">
                                {menuItems.map((item, index) => (
                                    <div key={index} className="flex items-center w-full h-[59px] gap-3">
                                        <span className="drop-shadow-[0_4px_2px_rgba(0,0,0,25%)]">{item.icon}</span>
                                        <a href={item.path} className="text-[#504E53]">{item.name}</a>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Logout button */}
                        <button
                            className="flex justify-start shadow-none h-[59px] p-0 w-full items-center gap-3"
                            onClick={handleLogout}
                        >
                            <span className="drop-shadow-[0_4px_2px_rgba(0,0,0,25%)]">
                                <LogoutCurve size="27" color="#05668D" />
                            </span>
                            <p className="text-[#504E53]">Log-out</p>
                        </button>
                    </div>
                </aside>
            )}

            {/* Mobile hamburger icon */}
            {!isDesktop && !sidebarOpen && (
                <aside className="p-5 w-17 bg-[#CCE5FE] h-screen">
                    <div className="">
                        <button className="m-auto"
                            onClick={() => setSidebarOpen(true)}
                        >
                            <HambergerMenu
                                size="20"
                                color="#504E53"
                            />
                        </button>
                    </div>
                </aside>
            )}

            {/* Main content */}
            <main className="flex-grow max-h-screen p-5 overflow-auto scrollbar-hide">
                {children}
            </main>
        </div>
    );
};

export default DashboardLayout;