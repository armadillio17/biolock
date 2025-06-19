import { useEffect } from "react";
import DashboardLayout from "@/layouts/DashboardLayout";
import { useAuthStore } from "@/store/authStore";
import { useOvertimeRequestStore } from "@/store/overtimeRequestStore";
import { Button } from "./ui/button";

export default function OvertimeRequest() {
  const { requests, loading, fetchRequests, handleAction } = useOvertimeRequestStore();
  useAuthStore(); // Assumed to check session or token

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  return (
    <DashboardLayout>
      <div className="p-4 space-y-6 md:p-6">
        <h1 className="text-2xl font-bold text-gray-800">Pending Overtime Requests</h1>

        <div className="overflow-hidden border border-gray-200 shadow-md rounded-xl bg-white/70 backdrop-blur-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-sm font-semibold text-left text-gray-700">Date</th>
                  <th className="px-6 py-3 text-sm font-semibold text-left text-gray-700">Employee</th>
                  <th className="px-6 py-3 text-sm font-semibold text-left text-gray-700">Submitted</th>
                  <th className="px-6 py-3 text-sm font-semibold text-left text-gray-700">Status</th>
                  <th className="px-6 py-3 text-sm font-semibold text-right text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  [...Array(4)].map((_, i) => (
                    <tr key={i}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="w-1/2 h-4 bg-gray-200 rounded animate-pulse"></div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="w-1/3 h-4 bg-gray-200 rounded animate-pulse"></div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="w-10 h-4 bg-gray-200 rounded animate-pulse"></div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="inline-block px-2 py-1 text-xs font-medium text-yellow-800 bg-yellow-100 rounded-full animate-pulse">
                          Loading
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right whitespace-nowrap">
                        <div className="flex justify-end space-x-2">
                          <div className="w-16 h-8 bg-gray-200 rounded animate-pulse"></div>
                          <div className="w-16 h-8 bg-gray-200 rounded animate-pulse"></div>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : requests.length > 0 ? (
                  requests.map((req) => (
                    <tr key={req.id} className="transition-colors duration-150 hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-600 whitespace-nowrap">{req.date}</td>
                      <td className="px-6 py-4 text-sm text-gray-600 whitespace-nowrap">{req.full_name}</td>
                      <td className="px-6 py-4 text-sm text-gray-600 whitespace-nowrap">
                        {new Date(req.created_at).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-medium rounded-full capitalize ${req.status === "approved"
                              ? "bg-green-100 text-green-800"
                              : req.status === "rejected"
                                ? "bg-red-100 text-red-800"
                                : "bg-yellow-100 text-yellow-800"
                            }`}
                        >
                          {req.status}
                        </span>
                      </td>
                      <td className="flex justify-end px-6 py-4 space-x-2 text-right whitespace-nowrap">
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-green-600 border-green-300 hover:bg-green-50"
                          onClick={() => handleAction(req.id, "approve")}
                        >
                          Approve
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-600 border-red-300 hover:bg-red-50"
                          onClick={() => handleAction(req.id, "reject")}
                        >
                          Reject
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                      No pending overtime requests.
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
