import UserLeaveRequest from "@/components/UserLeaveRequest";
import AdminLeaveRequest from "@/components/AdminLeaveRequest";
import { useAuthStore  } from "@/store/authStore"

export default function LeaveRequests() {

  const { user } = useAuthStore();

  return user.role === "admin" ? <AdminLeaveRequest /> : <UserLeaveRequest />
}
