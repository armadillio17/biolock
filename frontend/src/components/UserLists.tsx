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

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).replace(/\//g, '-');
  };

  const { newRegisteredUser, approvedUser, fetchNewUserList, fetchApprovedUserList, approvedRegisteredUser} = useUserStore();

  useEffect(() => {
    fetchNewUserList();
    fetchApprovedUserList();
  }, [fetchNewUserList, fetchApprovedUserList]);

  const handleApprove = async (userId: number) => {
    await approvedRegisteredUser(userId, true);
    await fetchNewUserList();
    await fetchApprovedUserList();
  };
  
  const handleDecline = async (userId: number) => {
    await approvedRegisteredUser(userId, false);
    await fetchNewUserList();
    await fetchApprovedUserList();
  };
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
                  <th className="py-2 px-4">Email</th>
                  <th className="py-2 px-4 w-1/3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {newRegisteredUser.length > 0 ? (
                  newRegisteredUser.map(request => (
                    <tr key={request.id} className="border-b border-gray-300">
                      <td className="py-2 px-4">{formatDate(request.created_at)}</td>
                      <td className="py-2 px-4">
                        {request.first_name} {request.last_name}
                      </td>
                      <td className="py-2 px-4">
                        {request.email}
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
                <th className="py-2 px-4">Email</th>
              </tr>
            </thead>
            <tbody>
            {approvedUser.length > 0 ? (
                  approvedUser.map(request => (
                    <tr key={request.id} className="border-b border-gray-300">
                      <td className="py-2 px-4">{formatDate(request.created_at)}</td>
                      <td className="py-2 px-4">
                        {request.first_name} {request.last_name}
                      </td>
                      <td className="py-2 px-4">
                        {request.email}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={3} className="py-4 text-center">No Approved Users</td>
                  </tr>
                )}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}