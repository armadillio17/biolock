import { useState, useEffect } from "react";
import UserDashboard from "@/components/UserDashboard";
import AdminDashboard from "@/components/AdminDashboard";

export default function Dashboard() {
  // const admin = true;
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {

    const userRole = localStorage.getItem("userRole");
    setIsAdmin(userRole === "admin")

  }, []);

  return isAdmin ? <AdminDashboard /> : <UserDashboard />
  // return admin ? <AdminDashboard /> : <UserDashboard />;
}
