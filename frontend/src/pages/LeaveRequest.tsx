import LeaveRequest from "@/components/UserLeaveRequest";

export default function LeaveRequests() {
  // const admin = true;
  // const [isAdmin, setIsAdmin] = useState(false);

  // useEffect(() => {

  //   const userRole = localStorage.getItem("userRole");
  //   setIsAdmin(userRole === "admin")

  // }, []);

  // return isAdmin ? <AdminEvent /> : <UserEvent />
  // return admin ? <AdminDashboard /> : <UserDashboard />;
  return <LeaveRequest />
}
