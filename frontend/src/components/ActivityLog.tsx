import { useState, useEffect } from "react";
import { base_url } from "../config";
import { authAxios } from "@/lib/secured-axios-instance";

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

export default function ActivityLog() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const formatType = (type: string): string => {
    return type
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const response = await authAxios.get(`${base_url}/notifications/`);
        setActivities(response.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An unknown error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();
  }, []);

  if (error)
    return (
      <div className="p-4 text-red-600 bg-red-50 rounded-lg">{error}</div>
    );

  return (
    <div className="flex flex-col gap-4 p-4">
      <h2 className="text-2xl font-bold text-gray-800">Recent Logs</h2>

      <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white/70 backdrop-blur-sm shadow-md">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider rounded-tl-lg">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider rounded-tr-lg">
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
            ) : activities.length > 0 ? (
              activities.map((activity) => {
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
                      {new Date(activity.created_at).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {formatType(activity.type)}
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
                <td colSpan={3} className="px-6 py-4 text-center text-gray-500">
                  No logs found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}