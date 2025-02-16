import DashboardLayout from "@/layouts/DashboardLayout"
import { adminCards  } from "@/data/dashboard-data.tsx"
import Chart  from "@/components/AdminDashboard/Chart.tsx"

const FormattedDate = () => {
  const today = new Date();
  const formattedDate = new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(today);

  return <p>{formattedDate}</p>;
};

function AdminDashboard() {
  const currentdate = FormattedDate();
  return (
    <DashboardLayout>
      <div className="flex flex-col">
        {/* Greetings and time */}
        <div className="flex flex-col text-[#4E4E53]">
          <p className="text-2xl font-bold">Welcome Back</p>
          <p className="text-sm">{currentdate}</p>
        </div>
        {/* Attendance Cards and Graphs */}
        <div className="flex flex-col items-center w-full mt-5 gap-8">
          <div className="grid w-full grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 max-w-[80vw] ">
            {adminCards.map((card, index) => (
              <div
                key={index}
                className="w-full min-h-[136px]  p-4 rounded-2xl shadow-md text-center text-[#4E4E53] text-[24px] border-[1px] border-black flex flex-col items-center justify-center"
            style={{
              backgroundColor: card.color,
            }}
              >
                <h3 className="font-bold">{card.title}</h3>
                <p className="font-semibold">{card.count}</p>
              </div>
            ))}
          </div>
          <div className="flex gap-8 w-full  text-[#4E4E53]">
            <div className="flex  flex-col justify-center items-center bg-[#B1E9F4] rounded-2xl p-5 max-h-[300px] p-5 text-center gap-5">
              <h4 className="text-[24px] font-bold">Lorem Ipsum</h4>
            <Chart />
            </div>
            <div className="w-full min-h-[450px] rounded-2xl bg-[#B1E9F4] p-5 border-black border-[1px]">
              <h4 className="text-[24px] font-bold">Activity Log</h4>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

export default AdminDashboard