import { useState } from "react";

export default function ActivityLog() {
    const [activities, setActivities] = useState([
        { id: 1, action: "User A logged in", timestamp: "10:00 AM" },
        { id: 2, action: "User B updated settings", timestamp: "10:15 AM" },
        { id: 3, action: "User C logged out", timestamp: "10:30 AM" },
    ]);
    return (
            <div className="flex flex-col">
                {/* Title */}
                <div className="flex flex-col text-[#4E4E53]">
                    <p className="text-2xl font-bold">Activity Logs</p>
                </div>
                {/* Event Details */}
                <div className="flex flex-col text-[#4E4E53] mt-5">
                    <div className="mt-6 overflow-x-auto">
                        <table className="min-w-full bg-white border border-gray-300">
                            <thead>
                                <tr className="bg-gray-200 text-gray-600 uppercase text-sm leading-normal">
                                    <th className="py-3 px-6 text-left">Date</th>
                                    <th className="py-3 px-6 text-left">Action</th>
                                    <th className="py-3 px-6 text-left">Details</th>
                                </tr>
                            </thead>
                            <tbody className="text-gray-600 text-sm font-light">
                                {/* Sample Data Row */}
                                <tr className="border-b border-gray-300 hover:bg-gray-100">
                                    <td className="py-3 px-6">2024-10-29</td>
                                    <td className="py-3 px-6">Lorem Ipsum</td>
                                    <td className="py-3 px-6">Lorem Ipsum</td>
                                    {/* <td className="py-3 px-6">Flu</td> */}
                                    {/* <td className="py-3 px-6">Approved</td> */}
                                </tr>
                                {/* Add more rows as needed */}
                                <tr className="border-b border-gray-300 hover:bg-gray-100">
                                    <td className="py-3 px-6">2023-11-10</td>
                                    <td className="py-3 px-6">Lorem Ipsum</td>
                                    <td className="py-3 px-6">Lorem Ipsum</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
    );
}
