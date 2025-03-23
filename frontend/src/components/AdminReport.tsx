import DashboardLayout from "@/layouts/DashboardLayout";
import { Button } from "./ui/button";

export default function AdminReport() {
  return (
    <DashboardLayout>
      <div className="flex flex-col">
        {/* Header with Button beside the Title */}
        <div className="flex items-center justify-between border-b border-gray-300 pb-2">
          <div className="flex items-center gap-4">
            <p className="text-lg font-semibold">Reports</p>
            <Button className="bg-green-500 text-white px-4 py-2 rounded-md">
              Generate Report
            </Button>
          </div>
        </div>

        {/* Table */}
        <div className="w-full mt-4">
          <div className="overflow-hidden border border-gray-300 rounded-lg">
            <table className="w-full border-collapse">
              <thead className="text-sm border-b border-gray-300">
                <tr>
                  <th className="p-3 text-left">Date</th>
                  <th className="p-3 text-left">Type</th>
                  <th className="p-3 text-left">Action</th>
                  <th className="p-3 text-left">Details</th>
                  <th className="p-3 text-center">View</th>
                  <th className="p-3 text-center">Download</th>
                </tr>
              </thead>
              <tbody>
                {/* Example Row */}
                <tr className="border-b border-gray-300">
                  <td className="p-3">09-18-2025</td>
                  <td className="p-3">Lorem Ipsum</td>
                  <td className="p-3">Lorem Ipsum</td>
                  <td className="p-3">Lorem Ipsum</td>
                  <td className="p-3 text-center">
                    <Button className="bg-green-500 text-white px-3 py-1 rounded-md">
                      View
                    </Button>
                  </td>
                  <td className="p-3 text-center">
                    <Button className="bg-blue-500 text-white px-3 py-1 rounded-md">
                      Download
                    </Button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
