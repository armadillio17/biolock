import { useState, useEffect } from "react";
import UserDashboard from "@/components/UserDashboard";
import AdminDashboard from "@/components/AdminDashboard";

function Dashboard() {
  // const admin = true;
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {

    const userRole = localStorage.getItem("userRole");
    setIsAdmin(userRole === "admin")

  }, []);

  return isAdmin ? <AdminDashboard /> : <UserDashboard />
  // return admin ? <AdminDashboard /> : <UserDashboard />;
}

export default Dashboard;
