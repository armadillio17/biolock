import { useState, useEffect } from "react";
import UserViewEvent from "@/components/UserViewEvent";
import AdminViewEvent from "@/components/AdminViewEvent";

export default function ViewEvents() {
  // const admin = true;
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {

    const userRole = localStorage.getItem("userRole");
    setIsAdmin(userRole === "admin")

  }, []);

  return isAdmin ? <AdminViewEvent /> : <UserViewEvent />
  // return admin ? <AdminDashboard /> : <UserDashboard />;
}
