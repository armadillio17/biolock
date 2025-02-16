"use client";

import { userCards  } from "@/data/dashboard-data.tsx"

export const Metrics = () => {
  return (

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
                        backgroundColor: card.color
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

    

  );
};
