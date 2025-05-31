import { useState, useEffect } from 'react';
import DashboardLayout from "@/layouts/DashboardLayout";
import { useAuthStore } from '@/store/authStore';
import { authAxios } from "@/lib/secured-axios-instance";
import { Button } from "./ui/button";
import { base_url } from '../config';

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

  const handleAction = async (id: number, action: 'approve' | 'reject') => {
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
      <div className="flex flex-col">
        <h1 className="text-2xl font-bold text-[#4E4E53] mb-6">Pending Overtime Requests</h1>

        {loading ? (
          <p>Loading...</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-300">
              <thead>
                <tr className="text-sm leading-normal text-gray-600 uppercase bg-gray-200">
                  <th className="px-6 py-3 text-left">Date</th>
                  <th className="px-6 py-3 text-left">Employee</th>
                  <th className="px-6 py-3 text-left">Hours</th>
                  <th className="px-6 py-3 text-left">Submitted</th>
                  <th className="px-6 py-3 text-left">Status</th>
                  <th className="px-6 py-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody className="text-sm font-light text-gray-600">
                {requests.length > 0 ? (
                  requests.map((req) => (
                    <tr key={req.id} className="border-b border-gray-300 hover:bg-gray-100">
                      <td className="px-6 py-3">{req.date}</td>
                      <td className="px-6 py-3">{req.full_name}</td>
                      <td className="px-6 py-3">{req.requested_hours} hours</td>
                      <td className="px-6 py-3">{new Date(req.created_at).toLocaleString()}</td>
                      <td className="px-6 py-3 capitalize">{req.status}</td>
                      <td className="px-6 py-3 space-x-2 flex items-center">
                        <Button
                          variant="default"
                          className="bg-green-600 hover:bg-green-700 text-white transition-colors duration-200"
                          onClick={() => handleAction(req.id, 'approve')}
                        >
                          Approve
                        </Button>
                        <Button
                          variant="destructive"
                          className="bg-red-600 hover:bg-red-700 text-white transition-colors duration-200"
                          onClick={() => handleAction(req.id, 'reject')}
                        >
                          Reject
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-3 text-center">
                      No pending requests.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}