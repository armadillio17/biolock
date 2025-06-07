import DashboardLayout from "@/layouts/DashboardLayout";
// import { adminCards } from "@/data/dashboard-data.tsx";
import { useDashboardStore } from "@/store/dashboardStore";
import { useEffect } from "react";
import StatCard from '../components/StatCard';
import { 
  Users, 
  FileText, 
  UserX, 
  UserCheck, 
  Home, 
  Plane,
  Calendar
} from 'lucide-react';

const FormattedDate = () => {
  const today = new Date();
  const formattedDate = new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(today);

  return <span className="text-gray-600 font-medium">{formattedDate}</span>;
};

function AdminDashboard() {
  const fetchUserCount = useDashboardStore((state) => state.fetchUserCount);
  const fetchLeaveCount = useDashboardStore((state) => state.fetchLeaveCount);
  const fetchStatusCount = useDashboardStore((state) => state.fetchStatusCount);
  const userCount = useDashboardStore((state) => state.userCount);
  const approvedLeave = useDashboardStore((state) => state.approvedLeave);
  const status = useDashboardStore((state) => state.status);

  useEffect(() => {
    fetchUserCount();
    fetchLeaveCount();
    fetchStatusCount();
  }, [fetchUserCount, fetchLeaveCount, fetchStatusCount]);

  const dashboardCards = [
    { 
      title: "Total Employees", 
      count: userCount.approvedUsers, 
      icon: Users,
      gradient: "bg-gradient-to-r from-blue-500 to-cyan-500"
    },
    { 
      title: "Leave Requests", 
      count: approvedLeave.approvedLeaveCount, 
      icon: FileText,
      gradient: "bg-gradient-to-r from-emerald-500 to-teal-500"
    },
    { 
      title: "Absent Today", 
      count: status.absentCount, 
      icon: UserX,
      gradient: "bg-gradient-to-r from-orange-500 to-red-500"
    },
    { 
      title: "Currently Working", 
      count: status.workingCount, 
      icon: UserCheck,
      gradient: "bg-gradient-to-r from-purple-500 to-pink-500"
    },
    { 
      title: "Day Off", 
      count: status.dayOffCount, 
      icon: Home,
      gradient: "bg-gradient-to-r from-indigo-500 to-purple-500"
    },
    { 
      title: "On Leave", 
      count: status.onLeaveCount, 
      icon: Plane,
      gradient: "bg-gradient-to-r from-amber-500 to-orange-500"
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Welcome Section */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-cyan-500/10 rounded-3xl blur-3xl" />
          <div className="relative bg-white/40 backdrop-blur-xl rounded-3xl p-8 border border-white/20 shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold text-gray-900 mb-2">
                  Welcome Back! 👋
                </h1>
                <FormattedDate />
                <p className="text-gray-600 mt-2">Here's what's happening with your team today.</p>
              </div>
              <div className="hidden md:block">
                <div className="w-24 h-24 bg-gradient-to-r from-indigo-500 to-cyan-500 rounded-2xl flex items-center justify-center">
                  <Calendar className="w-12 h-12 text-white" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {dashboardCards.map((card, index) => (
            <StatCard
              key={index}
              title={card.title}
              count={card.count}
              icon={card.icon}
              gradient={card.gradient}
              delay={index * 100}
            />
          ))}
        </div>

        {/* Additional Sections Placeholder */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Chart Section */}
          <div className="bg-white/40 backdrop-blur-xl rounded-3xl p-8 border border-white/20 shadow-xl">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Team Performance</h3>
            <div className="h-64 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl flex items-center justify-center">
              <p className="text-gray-500">Chart component would go here</p>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white/40 backdrop-blur-xl rounded-3xl p-8 border border-white/20 shadow-xl">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Recent Activity</h3>
            <div className="space-y-4">
              {[
                "John Doe submitted a leave request",
                "Sarah Smith checked in at 9:00 AM",
                "Mike Johnson completed overtime",
                "Emily Davis updated her profile"
              ].map((activity, index) => (
                <div key={index} className="flex items-center gap-3 p-3 bg-white/50 rounded-xl">
                  <div className="w-2 h-2 bg-gradient-to-r from-indigo-500 to-cyan-500 rounded-full" />
                  <p className="text-sm text-gray-700">{activity}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <style>
        {`
          @keyframes slideInUp {
            from {
              opacity: 0;
              transform: translateY(30px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        `}
      </style>
    </DashboardLayout>
  );
}

export default AdminDashboard;