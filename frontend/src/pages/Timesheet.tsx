import TimesheetReport from "@/components/UserTimesheet";
import { AttendanceTable } from "./AttendanceTable";
import { useAuthStore } from "@/store/authStore";

export default function Timesheet() {
  const { user } = useAuthStore();
  const isAdmin = user?.role === "admin";

  return isAdmin ? <AttendanceTable /> : <TimesheetReport />
}
