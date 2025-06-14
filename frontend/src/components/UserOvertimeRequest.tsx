import { useState, useEffect } from "react";
import DashboardLayout from "@/layouts/DashboardLayout";
import { useAuthStore } from "@/store/authStore";
import { authAxios } from "@/lib/secured-axios-instance";
import { Button } from "./ui/button";
import { base_url } from "../config";

interface OvertimeRequest {
  id: number;
  full_name: string;
  date: string;
  requested_hours: number;
  status: string;
  created_at: string;
}

export default function OvertimeRequest() {
  const [requests, setRequests] = useState<OvertimeRequest[]>([]);
  const [loading, setLoading] = useState(true);
  useAuthStore();

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const response = await authAxios.get(`${base_url}/approve-overtime/`);
        setRequests(response.data);
      } catch (error) {
        console.error("Failed to fetch overtime requests", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, []);

  const handleAction = async (id: number, action: "approve" | "reject") => {
    try {
      await authAxios.put(`${base_url}/approve-overtime/${id}/`, { action });
      const response = await authAxios.get(`${base_url}/approve-overtime/`);
      setRequests(response.data);
    } catch (error) {
      console.error(`Failed to ${action} request`, error);
    }
  };

  return (
    <DashboardLayout>
      <div className="p-4 md:p-6 space-y-6">
        {/* Header */}
        <h1 className="text-2xl font-bold text-gray-800">Pending Overtime Requests</h1>

        {/* Table Card */}
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white/70 backdrop-blur-sm shadow-md">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Date</th>
                  <th scope="col" className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Employee</th>
                  <th scope="col" className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Hours</th>
                  <th scope="col" className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Submitted</th>
                  <th scope="col" className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                  <th scope="col" className="px-6 py-3 text-right text-sm font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  // Skeleton Loader
                  [...Array(4)].map((_, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse"></div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="h-4 bg-gray-200 rounded w-1/3 animate-pulse"></div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="h-4 bg-gray-200 rounded w-10 animate-pulse"></div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="h-4 bg-gray-200 rounded w-1/3 animate-pulse"></div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="inline-block px-2 py-1 text-xs font-medium text-yellow-800 bg-yellow-100 rounded-full animate-pulse">
                          Loading
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="flex justify-end space-x-2">
                          <div className="h-8 bg-gray-200 rounded w-16 animate-pulse"></div>
                          <div className="h-8 bg-gray-200 rounded w-16 animate-pulse"></div>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : requests.length > 0 ? (
                  requests.map((req) => (
                    <tr key={req.id} className="hover:bg-gray-50 transition-colors duration-150">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{req.date}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{req.full_name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{req.requested_hours} hours</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {new Date(req.created_at).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full capitalize ${
                          req.status === 'approved'
                            ? 'bg-green-100 text-green-800'
                            : req.status === 'rejected'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {req.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right space-x-2 flex justify-end">
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
                    <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
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