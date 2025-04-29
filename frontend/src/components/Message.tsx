import DashboardLayout from "@/layouts/DashboardLayout";
import MessagesComponent from "@/components/MessagesComponent"

function Message() {
    return (
        <DashboardLayout>
            <div className="flex flex-col">
                {/* Event Details */}
                <div className="flex flex-col text-[#4E4E53] mt-5">
                    <div className="mt-6 overflow-x-auto">
                        <MessagesComponent />
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}


export default Message;
