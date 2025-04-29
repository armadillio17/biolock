// import { useState, useEffect } from "react";
import { useAuthStore  } from "@/store/authStore";
import UserDashboard from "@/components/UserDashboard";
import AdminDashboard from "@/components/AdminDashboard";

export default function Dashboard() {
  // const admin = true;
  // const [isAdmin, setIsAdmin] = useState(false);

  // useEffect(() => {

  //   const userRole = localStorage.getItem("userRole");
  //   setIsAdmin(userRole === "admin")

  // }, []);

  const { user } = useAuthStore();

  // console.log("user.role", user.role);
  

  return user.role === "admin" ? <AdminDashboard /> : <UserDashboard />
  // return admin ? <AdminDashboard /> : <UserDashboard />;
}
