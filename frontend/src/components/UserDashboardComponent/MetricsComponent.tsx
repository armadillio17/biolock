"use client";
import { useEffect } from "react";
import { useAttendanceStore } from '@/store/attendanceStore';

export const Metrics = () => {

    const {userAttendance, clockInUser, clockOutUser, fetchUserAttendance, isLoading } = useAttendanceStore();

    useEffect(() => {
        fetchUserAttendance();
    }, [fetchUserAttendance]);
    
    const userCards = [
        {
            group: "Clock In Group",
            items: [
                { title: "Clock In", color: "#52F76B" },
                { title: "Clock Out", color: "#7A8EF7" },
            ],
        },
        {
            group: "Daily Metrics",
            items: [
                { title: "Daily Hours", color:"#D1F8FF"},
                { title: "Daily Overtime", color:"#D1F8FF"},
                { title: "Messages", color:"#D1F8FF"},
            ],
        },
    ];

    const handleClockIn = async () => {
        if (!isLoading) {
          await clockInUser();
        }
      };

    const handleClockOut = async () => {
        if (!isLoading) {
          await clockOutUser();
        }
      };


  return (

    <div className="grid w-full grid-cols-1 gap-4 my-5 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4">

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
                        backgroundColor: card.color ,
                    }}
                    onClick={card.title === "Clock In" ? clockIn : clockOut}
                    > <h2 className={`font-bold m-3`}> {card.title} </h2>
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
                backgroundColor:'#D1F8FF',
                }}
                >
                    <h3 className="text-lg font-bold">{group.items[0]?.title}</h3>
                    <h1 className="p-4 text-4xl font-bold"> 1 </h1>
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
                backgroundColor:'#D1F8FF',
                }}
                >
                    <h3 className="text-lg font-bold">{group.items[1]?.title}</h3>
                    <h1 className="p-4 text-4xl font-bold"> 1 </h1>
                    {/* <p className="text-xl font-semibold">{card.count}</p> */}
                </div>
                ))}
            </div>
        </div>

        {/* Messages */}
        <div className="flex flex-col items-center w-full">
            <div className="w-full min-h-[136px]">
                {userCards
                .filter(group => group.group === "Daily Metrics")
                .map((group) => (
                <div
                    key={group.group}
                    className={`w-full min-h-[136px] p-4 rounded-2xl shadow-md text-center text-gray-800`}
                style={{
                backgroundColor:'#D1F8FF',
                }}
                >
                    <h3 className="text-lg font-bold">{group.items[2]?.title}</h3>
                    <h1 className="p-4 text-4xl font-bold"> 1 </h1>
                    {/* <p className="text-xl font-semibold">{card.count}</p> */}
                </div>
                ))}
            </div>
        </div>
    </div>

    

  );
};
