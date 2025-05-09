import DashboardLayout from "@/layouts/DashboardLayout";
import ActivityLog from "./ActivityLog";

function AdminActivityLog() {
    return (
        <DashboardLayout>
            <div className="flex flex-col">
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
