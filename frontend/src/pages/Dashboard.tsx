import UserDashboard from "@/components/UserDashboard";
import AdminDashboard from "@/components/AdminDashboard";

function Dashboard() {
  const admin = true; 

  return admin ? <AdminDashboard /> : <UserDashboard />;
}

export default Dashboard;
