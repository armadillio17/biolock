import DashboardLayout from "@/layouts/DashboardLayout";
import { Button } from "./ui/button";
import { useReportStore } from '@/store/reportStore';
import { useEffect, useState } from 'react';

export default function AdminReport() {
  const typeMapping: Record<string, string> = {
    daily_attendance: 'Daily Attendance Report',
    monthly_attendance: 'Monthly Attendance Report',
    custom_report: 'Custom Report',
    attendance_report: 'Attendace Report',
  };

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const {
    reportList,
    fetchReportList,
    generateDateRangeReport,
    downloadReportDataPDF,
    viewReportDataPDF,
    isLoading,
    pdfBlobUrl,
  } = useReportStore();

  useEffect(() => {
    fetchReportList();
  }, [fetchReportList]);

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

  const formatDate = (dateStr: string): string => {
    // return new Date(dateStr).toLocaleDateString();
    return new Date(dateStr).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  
  };

  return (
    <DashboardLayout>
      <div className="p-4 md:p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-4 border-b border-gray-200">
          <h1 className="text-xl font-bold text-gray-800">Reports</h1>
          <Button
            variant="outline"
            className="px-5 py-2 bg-gradient-to-r from-green-500 to-teal-500 text-white rounded-lg shadow hover:shadow-md transition-shadow"
            onClick={() => setShowDatePicker(true)}
            disabled={isLoading}
          >
            Generate Report
          </Button>
        </div>

        {/* Date Picker Modal */}
        {showDatePicker && (
          <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg space-y-4 w-[90%] max-w-md">
              <h2 className="text-lg font-semibold">Select Date Range</h2>
              <div className="flex flex-col gap-2">
                <label>
                  Start Date:
                  <input
                    type="date"
                    className="w-full border px-3 py-2 rounded mt-1"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </label>
                <label>
                  End Date:
                  <input
                    type="date"
                    className="w-full border px-3 py-2 rounded mt-1"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button
                  className="bg-gray-200 text-gray-700 hover:bg-gray-300"
                  onClick={() => setShowDatePicker(false)}
                >
                  Cancel
                </Button>
                <Button
                  className="bg-green-600 text-white hover:bg-green-700"
                  onClick={async () => {
                    if (startDate && endDate && startDate <= endDate) {
                      await generateDateRangeReport(startDate, endDate);
                      await fetchReportList();
                      setShowDatePicker(false);
                      setStartDate('');
                      setEndDate('');
                    } else {
                      alert('Please select a valid date range.');
                    }
                  }}
                >
                  Generate
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="flex flex-col lg:flex-row gap-6 h-[calc(90vh-80px)]">
          {/* Reports Table */}
          <div className="w-full lg:w-2/3 overflow-auto rounded-xl border border-gray-200 bg-white/70 backdrop-blur-sm shadow-md">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 table-fixed">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="w-8 px-3 py-3 text-left text-sm font-semibold text-gray-700"></th>
                    <th className="w-40 px-6 py-3 text-left text-sm font-semibold text-gray-700">Generated Date</th>
                    <th className="w-48 px-6 py-3 text-left text-sm font-semibold text-gray-700">Type</th>
                    <th className="w-36 px-6 py-3 text-left text-sm font-semibold text-gray-700">Start Date</th>
                    <th className="w-36 px-6 py-3 text-left text-sm font-semibold text-gray-700">End Date</th>
                    <th className="w-32 px-6 py-3 text-center text-sm font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {reportList && reportList.length > 0 ? (
                    reportList.map((report, index) => (
                        <tr
                          key={index}
                          className="hover:bg-blue-50 transition-colors duration-150 cursor-pointer"
                          onClick={(e) => {
                            e.preventDefault();   // prevent page reload
                            e.stopPropagation();  // prevent bubbling from buttons
                            if (!isLoading) handleViewReport(report.id);
                          }}
                        >
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {typeMapping[report.id] || report.id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {formatDate(report.created_at)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {typeMapping[report.type] || report.type}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {report.start_date || ""}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {report.end_date || ""}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="bg-green-600 hover:bg-green-500 text-white"
                            onClick={(e) => {
                              e.stopPropagation(); // prevent row click
                              handleDownloadReport(report.id);
                            }}
                          >
                            Download
                          </Button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                        No reports generated yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* PDF Viewer */}
          {pdfBlobUrl && (
            <div className="w-full lg:w-1/3 rounded-lg overflow-hidden shadow border border-gray-200">
              <iframe
                src={pdfBlobUrl}
                className="w-full h-full min-h-[400px]"
                title="PDF Viewer"
              />
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
