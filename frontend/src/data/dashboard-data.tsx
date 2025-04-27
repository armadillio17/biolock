import { Element4, Calendar, CalendarTick, CalendarAdd, CalendarEdit, DocumentText1, Profile2User, Activity } from "iconsax-react";
import dummyPic from "@/assets/dummy person.jpg";
// Define a type for the menu items
export interface SidebarMenuItem {
    name: string;
    icon: React.ReactNode;  // ✅ Use React.ReactNode for JSX compatibility
    path: string;
}


// Define a type for the profile
export interface SidebarProfile {
    name: string;
    position: string;
    img: string;
}

// Sidebar Menu Array
export const sidebarMenu: SidebarMenuItem[] = [
    { name: "Dashboard", icon: <Element4 size="27" color= "#0F217D" />, path: "/dashboard" },
    // { name: "Events", icon: <CalendarTick size="27" color= "#E26D5C" />, path: "/events" },
    { name: "Leave Request", icon: <CalendarAdd size="27" color= "#F988AA" />, path: "/leave-request" },
    { name: "Overtime", icon: <CalendarEdit size="27" color= "#53CDED" />, path: "/overtime" },
    { name: "Reports", icon: <DocumentText1 size="27" color= "#13A89E" />, path: "/reports" },
    { name: "Users", icon: <Profile2User size="27" color= "#FABA6C" />, path: "/users" },
    { name: "Activity Logs", icon: <Activity size="27" color= "#723D46" />, path: "/activity-logs" },
];

export const sidebarMenuUser: SidebarMenuItem[] = [
    { name: "Dashboard", icon: <Element4 size="27" color= "#0F217D" />, path: "/dashboard" },
    { name: "Timesheet", icon: <Calendar size="27" color= "#FF9F1C" />, path: "/timesheet" },
    { name: "Leave Request", icon: <CalendarAdd size="27" color= "#F988AA" />, path: "/leave-request" },
    { name: "Overtime", icon: <CalendarEdit size="27" color= "#53CDED" />, path: "/overtime" },
];

// Sidebar Profile Object
export const sidebarProfile: SidebarProfile = {
    name: "Francis Dave M.",
    position: "Senior Developer",
    img: dummyPic, // Corrected path
};

// Admin Dashboard array
export const adminCards = [
    { title: "New User", count: 1, color: "#9E8AFC" },
    { title: "Users", count: 1, color: "#54CEEE" },
    { title: "Request", count: 1, color: "#E26D5C" },
    { title: "Absent", count: 1, color: "#FF9F1C" },
    { title: "Working", count: 1, color: "#FFAAC3" },
    { title: "On Break", count: 1, color: "#52F76B" },
    { title: "Day Off", count: 1, color: "#BA6E7B" },
    { title: "On Leave", count: 1, color: "#FABA6C" },
];


export const Activitylogs= [
    {  },
];


export const userCards = [
    {
        group: "Clock In Group",
        items: [
            { title: "Clock In", count: 1, color: "#52F76B" },
            { title: "Clock Out", count: 1, color: "#7A8EF7" },
        ],
    },
    {
        group: "Daily Metrics",
        items: [
            { title: "Daily Hours", count: 1, color: "#D1F8FF" },
            { title: "Daily Overtime", count: 1, color: "#D1F8FF" },
            { title: "Daily Break", count: 1, color: "#D1F8FF" },
        ],
    },
];