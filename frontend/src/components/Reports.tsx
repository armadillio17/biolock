import DashboardLayout from "@/layouts/DashboardLayout";

function Reports() {
    return (
        <DashboardLayout>
            <div className="flex flex-col">
                {/* Title */}
                <div className="flex flex-col text-[#4E4E53]">
                    <p className="text-2xl font-bold">Reports</p>
                </div>
                {/* Event Details */}
                <div className="flex flex-col text-[#4E4E53] mt-5">
                    <div className="mt-6 overflow-x-auto">
                        <table className="min-w-full bg-white border border-gray-300">
                            <thead>
                                <tr className="text-sm leading-normal text-gray-600 uppercase bg-gray-200">
                                    <th className="px-6 py-3 text-left">Date</th>
                                    <th className="px-6 py-3 text-left">Type</th>
                                    <th className="px-6 py-3 text-left">Action</th>
                                    <th className="px-6 py-3 text-left">Details</th>
                                </tr>
                            </thead>
                            <tbody className="text-sm font-light text-gray-600">
                                {/* Sample Data Row */}
                                <tr className="border-b border-gray-300 hover:bg-gray-100">
                                    <td className="px-6 py-3">2024-10-29</td>
                                    <td className="px-6 py-3">Lorem Ipsum</td>
                                    <td className="px-6 py-3">Lorem Ipsum</td>
                                    {/* <td className="px-6 py-3">Flu</td> */}
                                    {/* <td className="px-6 py-3">Approved</td> */}
                                </tr>
                                {/* Add more rows as needed */}
                                <tr className="border-b border-gray-300 hover:bg-gray-100">
                                    <td className="px-6 py-3">2023-11-10</td>
                                    <td className="px-6 py-3">Lorem Ipsum</td>
                                    <td className="px-6 py-3">Lorem Ipsum</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}



export default Reports;
