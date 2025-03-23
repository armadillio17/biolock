import DashboardLayout from "@/layouts/DashboardLayout";
import { adminCards } from "@/data/dashboard-data.tsx";
import Chart from "@/components/AdminDashboard/Chart.tsx";
import ActivityLog from "./ActivityLog";

const FormattedDate = () => {
  const today = new Date();
  const formattedDate = new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(today);

  return <p className="text-sm">{formattedDate}</p>;
};

function AdminDashboard() {
  return (
    <DashboardLayout>
      <div className="flex flex-col">
        {/* Greetings and Date */}
        <div className="flex flex-col text-[#4E4E53]">
          <p className="text-2xl font-bold">Welcome Back</p>
          <FormattedDate />
        </div>

        {/* Attendance Cards & Graphs */}
        <div className="flex flex-col items-center w-full mt-5 gap-8">
          <div className="grid w-full grid-cols-4 gap-4 max-w-full">
            {adminCards.map((card, index) => (
              <div
                key={index}
                className="w-full min-h-[100px] p-4 rounded-xl shadow-md text-center text-[#4E4E53] text-[20px] border border-black flex flex-col items-center justify-center"
                style={{
                  backgroundColor: ["#B1E9F4", "#B9E4C9", "#FFF5B2", "#F4B1B1", "#FFB6C1", "#90EE90", "#BC8F8F", "#FFA07A"][index], // Adjusted colors
                }}
              >
                <h3 className="font-bold">{card.title}</h3>
                <p className="font-semibold">{card.count}</p>
              </div>
            ))}
          </div>

          {/* Graph & Activity Log */}
          <div className="flex gap-8 w-full">
            {/* Graph Section */}
            <div className="flex flex-col justify-center items-center bg-[#A4DDED] rounded-2xl p-5 w-1/2 text-center gap-5 shadow-lg border border-black">
              <h4 className="text-[24px] font-bold">Lorem Ipsum</h4>
              <Chart />
            </div>

            {/* Activity Log Section */}
            <div className="w-1/2 min-h-[250px] rounded-2xl bg-[#A4DDED] p-5 border border-black shadow-lg">
                <ActivityLog />
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default AdminDashboard;
