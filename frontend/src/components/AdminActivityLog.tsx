import { useState } from "react";
import DashboardLayout from "@/layouts/DashboardLayout";
import ActivityLog from "./ActivityLog";

function AdminActivityLog() {
    const [activities, setActivities] = useState([
        { id: 1, action: "User A logged in", timestamp: "10:00 AM" },
        { id: 2, action: "User B updated settings", timestamp: "10:15 AM" },
        { id: 3, action: "User C logged out", timestamp: "10:30 AM" },
    ]);
    return (
        <DashboardLayout>
            <div className="flex flex-col">
                {/* Title */}
                <div className="flex flex-col text-[#4E4E53]">
                    <p className="text-2xl font-bold">Activity Logs</p>
                </div>
                {/* Event Details */}
                <div className="flex flex-col text-[#4E4E53] mt-5">
                    <div className="mt-6 overflow-x-auto">
                        <ActivityLog />
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}



export default AdminActivityLog;
