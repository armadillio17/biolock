import DashboardLayout from "@/layouts/DashboardLayout";
import { Button } from "./ui/button";
import { useReportStore } from '@/store/reportStore';
import { useEffect } from 'react';

export default function AdminReport() {
  const typeMapping: Record<string, string> = {
    daily_attendance: 'Daily Attendance Report',
    monthly_attendance: 'Monthly Attendance Report',
    custom_report: 'Custom Report'
  };

  const {
    reportList,
    fetchReportList,
    generateDailyReport,
    downloadReportDataPDF,
    viewReportDataPDF,
    isLoading
  } = useReportStore();

  useEffect(() => {
    fetchReportList();
  }, [fetchReportList]);

  const handleGenerateReport = async () => {
    if (!isLoading) {
      await generateDailyReport();
      await fetchReportList();
    }
  };

  const handleDownloadReport = async (reportId: number) => {
    if (!isLoading) {
      await downloadReportDataPDF(reportId);
    }
  };

  const handleViewReport = async (reportId: number) => {
    if (!isLoading) {
      await viewReportDataPDF(reportId);
    }
  };

  return (
    <DashboardLayout>
      <div className="p-4 md:p-6 space-y-6">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-4 border-b border-gray-200">
          <h1 className="text-xl font-bold text-gray-800">Reports</h1>
          <Button
            className="px-5 py-2 bg-gradient-to-r from-green-500 to-teal-500 text-white rounded-lg shadow hover:shadow-md transition-shadow"
            onClick={handleGenerateReport}
            disabled={isLoading}
          >
            {isLoading ? "Generating..." : "Generate Daily Report"}
          </Button>
        </div>

        {/* Reports Table */}
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white/70 backdrop-blur-sm shadow-md">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Date</th>
                  <th scope="col" className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Type</th>
                  <th scope="col" className="px-6 py-3 text-right text-sm font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {isLoading ? (
                  // Skeleton Loader
                  [...Array(4)].map((_, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse"></div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="h-4 bg-gray-200 rounded w-1/3 animate-pulse"></div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="inline-block h-8 bg-gray-200 rounded w-16 animate-pulse"></div>
                      </td>
                    </tr>
                  ))
                ) : reportList && reportList.length > 0 ? (
                  reportList.map((report, index) => (
                    <tr key={index} className="hover:bg-gray-50 transition-colors duration-150">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {new Date(report.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {typeMapping[report.type] || report.type}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-blue-600 border-blue-300 hover:bg-blue-50"
                          onClick={() => handleViewReport(report.id)}
                        >
                          View
                        </Button>
                        <Button
                          variant="default"
                          size="sm"
                          className="bg-green-600 hover:bg-green-700 text-white"
                          onClick={() => handleDownloadReport(report.id)}
                        >
                          Download
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={3} className="px-6 py-8 text-center text-gray-500">
                      No reports generated yet.
                    </td>
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