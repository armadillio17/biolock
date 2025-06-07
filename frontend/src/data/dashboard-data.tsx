import { Element4, Calendar, CalendarAdd } from "iconsax-react";
import {
  LayoutDashboard,
  FileText,
  DollarSign,
  Clock,
  BarChart3,
  Users,
  Building2,
  UserCheck,
  Activity as LucideActivity,
} from "lucide-react";

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

// Sidebar Menu Array (Admin)
export const sidebarMenu: SidebarMenuItem[] = [
  { name: "Dashboard", icon: <LayoutDashboard />, path: "/dashboard" },
  { name: "Leave Request", icon: <FileText />, path: "/leave-request" },
  { name: "Payroll", icon: <DollarSign />, path: "/payroll" },
  { name: "Overtime", icon: <Clock />, path: "/overtime" },
  { name: "Reports", icon: <BarChart3 />, path: "/reports" },
  { name: "Users", icon: <Users />, path: "/users" },
  { name: "Departments", icon: <Building2 />, path: "/department" },
  { name: "Position", icon: <UserCheck />, path: "/position" },
  { name: "Activity Logs", icon: <LucideActivity />, path: "/activity-logs" },
];

export const sidebarMenuUser: SidebarMenuItem[] = [
    { name: "Dashboard", icon: <Element4 size="27" color= "#0F217D" />, path: "/dashboard" },
    // { name: "Inbox", icon: <Messenger size="27" color= "#6C4AB6" />, path: "/inbox" },
    { name: "Timesheet", icon: <Calendar size="27" color= "#FF9F1C" />, path: "/timesheet" },
    // { name: "Payslip", icon: <Calendar size="27" color= "#FF9F1C" />, path: "/timesheet" },
    { name: "Leave Request", icon: <CalendarAdd size="27" color= "#F988AA" />, path: "/leave-request" },
    // { name: "Overtime", icon: <CalendarEdit size="27" color= "#53CDED" />, path: "/overtime" },
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


