import { useState, useEffect } from 'react';
import DashboardLayout from "@/layouts/DashboardLayout"
import { Button } from "./ui/button"
import { authAxios } from "@/lib/secured-axios-instance";
import { base_url } from '../config';
import { useUserStore  } from "@/store/userlistStore";

export default function UserLists() {
  interface RegistrationUser {
    name?: string;
  }
  
  interface RegistrationRequest {
    id: number;
    created_at: string;
    user?: RegistrationUser;
    email?: string;
  }
  
  interface User {
    id: number;
    created_at: string;
    name?: string;
    email?: string;
  }
  const [registrationRequests, setRegistrationRequests] = useState<RegistrationRequest[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  
  const [loading, setLoading] = useState({
    requests: true,
    users: true
  });
  const [error, setError] = useState<{
    requests: string | null;
    users: string | null;
  }>({
    requests: null,
    users: null
  });

  // Fetch registration requests
  useEffect(() => {
    const fetchRegistrationRequests = async () => {
      try {
        const response = await authAxios.get(`${base_url}/user/`); // Adjust endpoint as needed
        setRegistrationRequests(response.data);
        setLoading(prev => ({ ...prev, requests: false }));
      } catch (err) {
        setError(prev => ({ ...prev, requests: (err as Error).message }));
        setLoading(prev => ({ ...prev, requests: false }));
      }
    };

    fetchRegistrationRequests();
  }, []);

  // Fetch users
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await authAxios.get(`${base_url}/user/`); // Adjust endpoint as needed
        setUsers(response.data);
        setLoading(prev => ({ ...prev, users: false }));
      } catch (err) {
        setError(prev => ({ ...prev, users: (err as Error).message }));
        setLoading(prev => ({ ...prev, users: false }));
      }
    };

    fetchUsers();
  }, []);

  const handleApprove = async (id: number) => {
    try {
      await authAxios.put(`${base_url}/registration-requests/${id}/approve/`);
      setRegistrationRequests(registrationRequests.filter(request => request.id !== id));
      // Optionally add the approved user to the users list
      // You might want to refetch users instead
    } catch (err) {
      setError(prev => ({ ...prev, requests: (err as Error).message }));
    }
  };

  const handleDecline = async (id: number) => {
    try {
      await authAxios.put(`${base_url}/registration-requests/${id}/decline/`);
      setRegistrationRequests(registrationRequests.filter(request => request.id !== id));
    } catch (err) {
      setError(prev => ({ ...prev, requests: (err as Error).message }));
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).replace(/\//g, '-');
  };

  const { userList, fetchUserList } = useUserStore();
  
  useEffect(() => {
    fetchUserList();
  }, [fetchUserList]);

  // console.log("userList", userList);

  return (
    <DashboardLayout>
      <div className="flex flex-col">
        <h2 className="text-xl font-bold text-center">Users</h2>
        
        {/* Registration Request Section */}
        <div className="mt-4">
          <h3 className="text-lg font-semibold text-center">Registration Request</h3>
          {loading.requests ? (
            <p className="text-center">Loading requests...</p>
          ) : error.requests ? (
            <p className="text-center text-red-500">Error: {error.requests}</p>
          ) : (
            <table className="min-w-full border border-gray-300 text-center">
              <thead>
                <tr className="border-b border-gray-300 bg-gray-100">
                  <th className="py-2 px-4">Date</th>
                  <th className="py-2 px-4">Users</th>
                  <th className="py-2 px-4 w-1/3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {registrationRequests.length > 0 ? (
                  registrationRequests.map(request => (
                    <tr key={request.id} className="border-b border-gray-300">
                      <td className="py-2 px-4">{formatDate(request.created_at)}</td>
                      <td className="py-2 px-4">
                        {request.user?.name || request.email || 'N/A'}
                      </td>
                      <td className="py-2 px-4 w-1/3">
                        <Button 
                          onClick={() => handleApprove(request.id)}
                          className="bg-green-500 text-white px-4 py-1 rounded hover:bg-green-600"
                        >
                          Approve
                        </Button>
                        <Button 
                          onClick={() => handleDecline(request.id)}
                          className="bg-red-500 text-white px-4 py-1 rounded ml-2 hover:bg-red-600"
                        >
                          Decline
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={3} className="py-4 text-center">No pending registration requests</td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
        
        {/* User List Section */}
        <div className="mt-6">
          <h3 className="text-lg font-semibold text-center">User List</h3>
          <table className="min-w-full border border-gray-300 text-center">
            <thead>
              <tr className="border-b border-gray-300 bg-gray-100">
                <th className="py-2 px-4">Date</th>
                <th className="py-2 px-4">Users</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-gray-300">
                <td className="py-2 px-4">09-18-2025</td>
                <td className="py-2 px-4">Lorem Ipsum</td>
              </tr>
              <tr className="border-b border-gray-300">
                <td className="py-2 px-4">09-18-2025</td>
                <td className="py-2 px-4">Lorem Ipsum</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}