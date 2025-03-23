import DashboardLayout from "@/layouts/DashboardLayout";
import { ViewEventComponent  } from "./UserDashboardComponent/ViewEventComponent";

export default function UserViewEvent() {

  return (
    <DashboardLayout>
      <div className="flex flex-col">
        {/* Title */}
        <div className="flex flex-col text-[#4E4E53]">
          <p className="text-2xl font-bold">Events</p>
        </div>

        {/* Event Details */}
        <div className="flex flex-col text-[#4E4E53] mt-5">
          <div className="flex flex-col w-full h-[85vh] rounded-2xl px-6 bg-[#D1F8FF] overflow-auto no-scrollbar">
            <ViewEventComponent />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}