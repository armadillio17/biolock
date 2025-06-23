import DashboardLayout from "@/layouts/DashboardLayout";
import SystemLogs from "@/components/SystemLogs";

function AdminActivityLog() {
    return (
        <DashboardLayout>
            <div className="flex flex-col">
                {/* Event Details */}
                <div className="flex flex-col text-[#4E4E53] mt-5">
                    <div className="mt-6 overflow-x-auto">
                        <SystemLogs />
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}


export default AdminActivityLog;
