import DashboardLayout from "@/layouts/DashboardLayout"
import { Metrics }  from "@/components/UserDashboardComponent/MetricsComponent"
// import { EventCarousel }  from "@/components/UserDashboardComponent/EventCarouselComponent"
// import { Timesheet }  from "@/components/UserDashboardComponent/TimesheetComponent"
import { Notification }  from "@/components/UserDashboardComponent/NotificationComponent"
// import { Calendar } from "@/components/UpdatedCalendarComponent"


// import { useAuthStore  } from "@/store/authStore"

const FormattedDate = () => {
  const today = new Date();
  const formattedDate = new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(today);

  return <p>{formattedDate}</p>;
};

function UserDashboard() {
  return (
    <DashboardLayout>
      <div className="flex flex-col">
        {/* Greetings and time */}
        <div className="flex flex-col text-[#4E4E53]">
          <p className="text-2xl font-bold">Welcome Back</p>
          <p className="text-sm"><FormattedDate /></p>
        </div>

        <Metrics />
        {/* <EventCarousel /> */}
        <div className="grid w-full grid-cols-1 gap-4 my-5 sm:grid-cols-2 lg:grid-cols-2">
          {/* Messages component */}
          <div className="w-full h-auto rounded-2xl px-4 sm:px-6 py-4 my-2 sm:my-5 bg-[#D1F8FF]">
            <div className="flex flex-col text-[#4E4E53]">
              <p className="text-xl font-bold sm:text-2xl">Messages</p>
              <div className="h-[320px] sm:h-[440px] mt-3 sm:mt-5 overflow-auto no-scrollbar">
                {/* <MessagesComponent /> */}
              </div>
            </div>
          </div>

          {/* Notification component */}
          <div className="w-full h-auto rounded-2xl px-4 sm:px-6 py-4 my-2 sm:my-5 bg-[#D1F8FF]">
            <div className="flex flex-col text-[#4E4E53]">
              <p className="text-xl font-bold sm:text-2xl">Notification</p>
              <div className="h-[320px] sm:h-[440px] mt-3 sm:mt-5 overflow-auto no-scrollbar">
                <Notification />
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default UserDashboard;