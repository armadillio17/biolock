import DashboardLayout from "@/layouts/DashboardLayout"
import { Admincards  } from "@/data/dashboard-data.tsx"

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
        <div className="flex flex-col items-center w-full">
          <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {Admincards.map((card, index) => (
              <div
                key={index}
                className={`max-w-[230px] min-h-[136px]  p-4 rounded-2xl shadow-md text-center text-gray-800`}
            style={{
              backgroundColor: card.color,
            }}
              >
                <h3 className="text-lg font-bold">{card.title}</h3>
                <p className="text-xl font-semibold">{card.count}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

export default AdminDashboard