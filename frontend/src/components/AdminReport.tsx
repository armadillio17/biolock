import DashboardLayout from "@/layouts/DashboardLayout";
import { Button } from "./ui/button";
import { useReportStore } from '@/store/reportStore.ts';
import { useEffect } from 'react';

export default function AdminReport() {

  const typeMapping: Record<string, string> = {
    daily_attendance: 'Daily Attendance Report',
    monthly_attendance: 'Monthly Attendance Report',
    custom_report: 'Custom Report'
  };
  const { reportList, fetchReportList, generateDailyReport, downloadReportDataPDF, viewReportDataPDF, isLoading } = useReportStore();

  useEffect(() => {
    fetchReportList();
  }, [fetchReportList]);

  const handleGenerateReport = async () => {
    if (!isLoading) {
      await generateDailyReport();
      await fetchReportList();
    }
  };

  

  const handleDownloadReport = async ($reportId:number) => {
    if (!isLoading) {
      await downloadReportDataPDF($reportId);
    }
  };

  const handleViewReport = async ($reportId:number) => {
    if (!isLoading) {
      await viewReportDataPDF($reportId);
    }
  };
  return (
    <DashboardLayout>
      <div className="flex flex-col">
        {/* Header with Button beside the Title */}
        <div className="flex items-center justify-between pb-2 border-b border-gray-300">
          <div className="flex items-center gap-4">
            <p className="text-lg font-semibold">Reports</p>
            <Button 
            className="px-4 py-2 text-white bg-green-500 rounded-md"
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
                      <td className="px-6 py-3 text-center">
                        {new Date(report.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-3 text-center">
                        {/* Using a type check or fallback for safety */}
                        {typeMapping[report.type] || report.type}
                      </td>
                      <td className="px-6 py-3 text-center">
                        <Button
                          className="px-4 py-1 text-white bg-green-500 rounded"
                          onClick={() => handleViewReport(report.id)}
                        >
                          View
                        </Button>
                        <Button
                          className="px-4 py-1 ml-2 text-white bg-blue-500 rounded"
                          onClick={() => handleDownloadReport(report.id)}
                        >
                          Download
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr className="border-b border-gray-300">
                    <td className="px-6 py-3" colSpan={3}>No Generated Report.</td>
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
