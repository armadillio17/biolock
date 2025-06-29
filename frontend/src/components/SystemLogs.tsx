import { useState, useEffect } from "react";
import { Calendar, Download, Filter, FileText, Clock, AlertCircle } from "lucide-react";
import { base_url } from "../config";
import { authAxios } from "@/lib/secured-axios-instance";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Button } from "./ui/button";

interface ActivityData {
  status?: string;
  details?: string;
  [key: string]: any;
}

interface Activity {
  id: string;
  created_at: string;
  type: string;
  data?: ActivityData | string;
}

export default function SystemLog() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [filteredActivities, setFilteredActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [generateReportLoading] = useState(false);
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [showDateFilter, setShowDateFilter] = useState(false);

  const formatType = (type: string): string => {
    return type
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const filterActivitiesByDateRange = () => {
    if (!startDate && !endDate) {
      setFilteredActivities(activities);
      return;
    }
    const filtered = activities.filter((activity) => {
      const activityDate = new Date(activity.created_at);
      const start = startDate ? new Date(startDate) : null;
      const end = endDate ? new Date(endDate + 'T23:59:59') : null;
      if (start && end) {
        return activityDate >= start && activityDate <= end;
      } else if (start) {
        return activityDate >= start;
      } else if (end) {
        return activityDate <= end;
      }
      return true;
    });
    setFilteredActivities(filtered);
  };

  const clearDateFilter = () => {
    setStartDate("");
    setEndDate("");
    setFilteredActivities(activities);
  };

  const handleGenerateReport = () => {
    if (!startDate || !endDate) {
      toast.warn("Please select both start and end dates to generate the report.");
      return;
    }

    const params = new URLSearchParams();
    params.append("start_date", startDate);
    params.append("end_date", endDate);

    const url = `${base_url}/systemlogs/generate-report/?${params.toString()}`;
    window.open(url, "_blank");
  };

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const response = await authAxios.get(`${base_url}/systemlogs/`);
        setActivities(response.data);
        setFilteredActivities(response.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An unknown error occurred");
      } finally {
        setLoading(false);
      }
    };
    fetchActivities();
  }, []);

  useEffect(() => {
    filterActivitiesByDateRange();
  }, [startDate, endDate, activities]);

  if (error)
    return (
      <div className="p-4 text-red-600 bg-red-50 rounded-lg flex items-center gap-2">
        <AlertCircle className="w-5 h-5" />
        {error}
      </div>
    );

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <FileText className="w-8 h-8 text-indigo-600" />
          <h2 className="text-3xl font-bold text-gray-800">System Logs</h2>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowDateFilter(!showDateFilter)}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors duration-200"
          >
            <Filter className="w-4 h-4" />
            Filter by Date
          </button>
          
          <Button
            variant="outline"
            onClick={handleGenerateReport}
            className={`flex items-center gap-2 px-6 py-2 text-white rounded-lg shadow-md transition-colors duration-200
              ${(!startDate || !endDate) 
                ? "bg-gray-400 cursor-not-allowed" 
                : "bg-indigo-600 hover:bg-indigo-700"}`}
          >
            {generateReportLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Generating...
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                Generate System Logs
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Date Filter Panel */}
      {showDateFilter && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-gray-500" />
              <span className="font-medium text-gray-700">Date Range:</span>
            </div>
            
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-600">From:</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-600">To:</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            
            {(startDate || endDate) && (
              <button
                onClick={clearDateFilter}
                className="px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors duration-200"
              >
                Clear Filter
              </button>
            )}
            
            <div className="text-sm text-gray-500 flex items-center gap-1">
              <Clock className="w-4 h-4" />
              Showing {filteredActivities.length} of {activities.length} entries
            </div>
          </div>
        </div>
      )}

      {/* Activities Table */}
      <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-md">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider rounded-tl-lg">
                Date & Time
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider">
                Activity Type
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider rounded-tr-lg">
                Details
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {loading ? (
              <>
                {[...Array(5)].map((_, index) => (
                  <tr key={index} className="animate-pulse">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="h-4 bg-gray-200 rounded w-full"></div>
                    </td>
                  </tr>
                ))}
              </>
            ) : filteredActivities.length > 0 ? (
              filteredActivities.map((activity) => {
                let parsedData: ActivityData = {};

                if (typeof activity.data === "string") {
                  try {
                    parsedData = JSON.parse(activity.data);
                  } catch (e) {
                    console.error("Failed to parse activity.data:", e);
                  }
                } else if (typeof activity.data === "object" && activity.data !== null) {
                  parsedData = activity.data;
                }

                return (
                  <tr
                    key={activity.id}
                    className="hover:bg-gray-50 transition-colors duration-150"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      <div className="flex flex-col">
                        <span className="font-medium">
                          {new Date(activity.created_at).toLocaleDateString()}
                        </span>
                        <span className="text-xs text-gray-500">
                          {new Date(activity.created_at).toLocaleTimeString()}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                        {formatType(activity.type)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div className="space-y-1">
                        {parsedData.status && (
                          <p>
                            <span className="font-semibold text-gray-800">
                              Status:
                            </span>{" "}
                            <span>{parsedData.status}</span>
                          </p>
                        )}
                        {parsedData.details && (
                          <p>
                            <span className="font-semibold text-gray-800">
                              Details:
                            </span>{" "}
                            <span>{parsedData.details}</span>
                          </p>
                        )}
                        {!parsedData.status && !parsedData.details && (
                          <span className="text-gray-400">N/A</span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={3} className="px-6 py-12 text-center">
                  <div className="flex flex-col items-center gap-2 text-gray-500">
                    <FileText className="w-8 h-8" />
                    <span className="text-lg font-medium">No logs found</span>
                    <span className="text-sm">
                      {(startDate || endDate) 
                        ? "Try adjusting your date range filter" 
                        : "No activity logs are available"}
                    </span>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} theme="colored" />
    </div>
  );
}