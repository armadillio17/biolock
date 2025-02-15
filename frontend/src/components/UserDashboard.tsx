import DashboardLayout from "@/layouts/DashboardLayout"
import { userCards  } from "@/data/dashboard-data.tsx"
import { imgData, table, notif } from '@/data/ts/dummyData';

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
  const currentdate = FormattedDate();
  return (
    <DashboardLayout>
      <div className="flex flex-col">
        {/* Greetings and time */}
        <div className="flex flex-col text-[#4E4E53]">
          <p className="text-2xl font-bold">Welcome Back</p>
          <p className="text-sm">{currentdate}</p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 my-5 w-full">

          {/* Clock In Group */}
          <div className="flex flex-col items-center w-full">
            <div className=" flex flex-col items-center w-full min-h-[136px]">
              {userCards
              .filter(group => group.group === "Clock In Group")
              .map((group) => (
                <div 
                key = {group.group}
                className={`flex flex-col items-center justify-center w-full h-full grid grid-cols-1 gap-y-4 text-center`}
                >
                  {group.items.map((card, index) => (
                    <div 
                    key = {index}
                    className={`flex flex-col items-center w-full h-full shadow-md rounded-2xl shadow-md text-center text-gray-800`}
                    style={{ 
                      backgroundColor: group.items[0]?.color
                    }}
                    > <h2 className={` m-3`}> {card.title} </h2>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>

          {/* Daily Hours */}
          <div className="flex flex-col items-center w-full">
            <div className="w-full min-h-[136px]">
              {userCards
              .filter(group => group.group === "Daily Metrics")
              .map((group) => (
                <div
                  key={group.group}
                  className={`w-full h-full p-4 rounded-2xl shadow-md text-center text-gray-800`}
              style={{
                backgroundColor: group.items[0].color,
              }}
                >
                  <h3 className="text-lg font-bold">{group.items[0]?.title}</h3>
                  <h1 className="text-4xl font-bold p-4"> 1 </h1>
                  {/* <p className="text-xl font-semibold">{card.count}</p> */}
                </div>
              ))}
            </div>
          </div>

          {/* Daily Overtime */}
          <div className="flex flex-col items-center w-full">
            <div className="w-full min-h-[136px]">
              {userCards
              .filter(group => group.group === "Daily Metrics")
              .map((group) => (
                <div
                  key={group.group}
                  className={`w-full min-h-[136px] p-4 rounded-2xl shadow-md text-center text-gray-800`}
              style={{
                backgroundColor: group.items[0].color,
              }}
                >
                  <h3 className="text-lg font-bold">{group.items[1]?.title}</h3>
                  <h1 className="text-4xl font-bold p-4"> 1 </h1>
                  {/* <p className="text-xl font-semibold">{card.count}</p> */}
                </div>
              ))}
            </div>
          </div>

          {/* Daily Break */}
          <div className="flex flex-col items-center w-full">
            <div className="w-full min-h-[136px]">
              {userCards
              .filter(group => group.group === "Daily Metrics")
              .map((group) => (
                <div
                  key={group.group}
                  className={`w-full min-h-[136px] p-4 rounded-2xl shadow-md text-center text-gray-800`}
              style={{
                backgroundColor: group.items[0].color,
              }}
                >
                  <h3 className="text-lg font-bold">{group.items[2]?.title}</h3>
                  <h1 className="text-4xl font-bold p-4"> 1 </h1>
                  {/* <p className="text-xl font-semibold">{card.count}</p> */}
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Events */}
        <div className="flex flex-col w-full max-h-[499px] rounded-2xl px-6 py-4 bg-[#D9D9D9]">
          <div className=" overflow-hidden text-ellipsis" >
            <div className="flex flex-col text-[#4E4E53]">
              <p className="text-2xl font-bold">Events</p>
            </div>

            <div className="grid grid-cols-2 gap-4 my-5 w-full">
              <div>
                <img className="w-full h-full bg-[#D9D9D9]"></img>

              </div>
              <div className="w-full h-full p-2 overflow-hidden">
                <h1 className="text-[18px] font-bold">Lorem Ipsum</h1>
                <h2 className="my-1 text-[12px] font-normal">March 25, 2025</h2>
                <p className="w-full max-h-[247px] my-5 text-[16px] font-normal overflow-hidden">
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. In pellentesque posuere leo non porta. 
                  Cras eget scelerisque magna. Nulla ultricies eget turpis sit amet interdum. Aenean egestas ac metus eu vehicula. 
                  Integer fringilla malesuada ultricies. Proin lobortis mattis feugiat. Cras posuere ultricies ligula, 
                  laoreet venenatis lorem bibendum vitae. Lorem ipsum dolor sit amet, consectetur adipiscing elit. 
                  In pellentesque posuere leo non porta.
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4 my-5 w-full">
  
        {/* Timesheet Record - Takes 2/3 of the space */}
        <div className="col-span-2 flex flex-col w-full max-h-[499px] rounded-2xl px-6 py-4 my-5 bg-[#D9D9D9]">
          <div className="h-auto">
            <div className="flex flex-col text-[#4E4E53]">
              <p className="text-2xl font-bold">Timesheet Record</p>
            </div>

            {/* Table Wrapper */}
            <div className="h-[400px] mt-5 rounded-lg bg-white shadow-lg">
              <table className="w-full border-collapse">
                <thead className="font-bold text-[14px] text-gray-700 bg-gray-300">
                  <tr>
                    <th className="p-3 text-center">Date</th>
                    <th className="p-3 text-center">Clock In</th>
                    <th className="p-3 text-center">Clock Out</th>
                    <th className="p-3 text-center">Status</th>
                    <th className="p-3 text-center">Total Hours</th>
                    <th className="p-3 text-center">Overtime</th>
                  </tr>
                </thead>
              </table>

              {/* Scrollable tbody */}
              <div className="h-[350px] overflow-auto">
                <table className="w-full border-collapse">
                  <tbody className="text-gray-700">
                    {table.map((row, index) => (
                      <tr
                        key={row.id}
                        className={`border-b ${
                          index % 2 === 0 ? "bg-gray-100" : "bg-white"
                        } font-normal text-[12px]`}
                      >
                        <td className="p-3">{row.date}</td>
                        <td className="p-3">{row.clockIn}</td>
                        <td className="p-3">{row.clockOut}</td>
                        <td className="p-3">{row.status}</td>
                        <td className="p-3">{row.totalHours}</td>
                        <td className="p-3">{row.overtime}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Notification - Takes 1/3 of the space */}
        <div className="col-span-1 flex flex-col w-full max-h-[499px] rounded-2xl px-6 py-4 my-5 bg-[#D9D9D9]">
          <div className="flex flex-col text-[#4E4E53]">
            <p className="text-2xl font-bold">Notification</p>
          </div>

          <div className="overflow-y-auto max-h-[450px] pr-2 my-5 ">
            {notif.map((item) => (
              <div key={item.id} className="w-full p-3 mb-3 bg-white rounded-2xl shadow ">
                  <p className="text-[16px] font-normal">{item.message}</p>
              </div>
            ))}
          </div>

        </div>
      </div>
    </div>

      
    </DashboardLayout>
  )
}

export default UserDashboard