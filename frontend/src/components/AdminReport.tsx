import DashboardLayout from "@/layouts/DashboardLayout";
import { Button } from "./ui/button";
import { useReportStore } from '@/store/reportStore.ts';
import { useEffect, useState } from 'react';

export default function AdminReport() {

  const typeMapping = {
    "daily_attendance": "Daily Attendance",
    // Add other types here as needed
  };
  
  const { reportList, fetchReportList, generateDailyReport, isLoading } = useReportStore();

  useEffect(() => {
    fetchReportList();
  }, [fetchReportList]);

  const handleGenerateReport = async () => {
    if (!isLoading) {
      await generateDailyReport();
    }
  };
  return (
    <DashboardLayout>
      <div className="flex flex-col">
        {/* Header with Button beside the Title */}
        <div className="flex items-center justify-between border-b border-gray-300 pb-2">
          <div className="flex items-center gap-4">
            <p className="text-lg font-semibold">Reports</p>
            <Button 
            className="bg-green-500 text-white px-4 py-2 rounded-md"
            onClick={handleGenerateReport}
            >
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
                  <th className="p-3 text-center">Date</th>
                  <th className="p-3 text-center">Type</th>
                  <th className="p-3 text-center">Download</th>
                </tr>
              </thead>
              <tbody>
                {reportList && reportList.length > 0 ? (
                  reportList.map((report, index) => (
                    <tr key={index} className="border-b border-gray-300 hover:bg-gray-100">
                      <td className="py-3 px-6 text-center">
                        {new Date(report.created_at).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-6 text-center">{typeMapping[report.type] || report.type}</td>
                      <td className="py-3 px-6 text-center">
                        <Button 
                          className="bg-green-500 text-white px-4 py-1 rounded"
                          // onClick={() => handleViewReport(report)}
                        >
                          View
                        </Button>
                        <Button 
                          className="bg-blue-500 text-white px-4 py-1 rounded ml-2"
                          // onClick={() => updateLeaveRequest("declined", leave.id)}
                        >
                          Download
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr className="border-b border-gray-300">
                    <td className="py-3 px-6" colSpan={3}>No Generated Report.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
