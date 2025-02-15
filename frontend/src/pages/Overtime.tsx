import OvertimeRequest from "@/components/UserOvertimeRequest";

export default function Overtime() {
  // const admin = true;
  // const [isAdmin, setIsAdmin] = useState(false);

  // useEffect(() => {

  //   const userRole = localStorage.getItem("userRole");
  //   setIsAdmin(userRole === "admin")

  // }, []);

  // return isAdmin ? <AdminEvent /> : <UserEvent />
  // return admin ? <AdminDashboard /> : <UserDashboard />;
  return <OvertimeRequest />
}
