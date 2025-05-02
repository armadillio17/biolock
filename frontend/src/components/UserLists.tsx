import { useState, useEffect } from 'react';
import DashboardLayout from "@/layouts/DashboardLayout"
import { Button } from "./ui/button"
import { useUserStore } from "@/store/userlistStore";

export default function UserLists() {

  const { newRegisteredUser, approvedUser, fetchNewUserList, fetchApprovedUserList, approvedRegisteredUser, error } = useUserStore();
  const [localLoading, setLocalLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLocalLoading(true);
      try {
        await Promise.all([
          fetchNewUserList(),
          fetchApprovedUserList()
        ]);
      } catch (err) {
        console.error("Failed to load user data:", err);
      } finally {
        setLocalLoading(false);
      }
    };
    
    loadData();
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

  const formatDate = (dateStr: string): string => {
    return new Date(dateStr).toLocaleDateString();
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col">
        <h2 className="text-xl font-bold text-center">Users</h2>

        {/* Registration Request Section */}
        <div className="mt-4">
          <h3 className="text-lg font-semibold text-center">Registration Request</h3>
          {localLoading ? (  // Changed from isLoading to localLoading
            <p className="text-center">Loading requests...</p>
          ) : error ? (
            <p className="text-center text-red-500">Error: {error}</p>
          ) : (
            <table className="min-w-full text-center border border-gray-300">
              <thead>
                <tr className="bg-gray-100 border-b border-gray-300">
                  <th className="px-4 py-2">Date</th>
                  <th className="px-4 py-2">Users</th>
                  <th className="px-4 py-2">Email</th>
                  <th className="w-1/3 px-4 py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {newRegisteredUser.length > 0 ? (
                  newRegisteredUser.map(request => (
                    <tr key={request.id} className="border-b border-gray-300">
                      <td className="px-4 py-2">{formatDate(request.created_at)}</td>
                      <td className="px-4 py-2">
                        {request.first_name} {request.last_name}
                      </td>
                      <td className="px-4 py-2">
                        {request.email}
                      </td>
                      <td className="w-1/3 px-4 py-2">
                        <Button
                          onClick={() => handleApprove(request.id)}
                          className="px-4 py-1 text-white bg-green-500 rounded hover:bg-green-600"
                        >
                          Approve
                        </Button>
                        <Button
                          onClick={() => handleDecline(request.id)}
                          className="px-4 py-1 ml-2 text-white bg-red-500 rounded hover:bg-red-600"
                        >
                          Decline
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="p-4 text-center">No pending registration requests</td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>

        {/* User List Section */}
        <div className="mt-6">
          <h3 className="text-lg font-semibold text-center">User List</h3>
          {localLoading ? (  // Changed from isLoading to localLoading
            <p className="text-center">Loading requests...</p>
          ) : error ? (
            <p className="text-center text-red-500">Error: {error}</p>
          ) : (
            <table className="min-w-full text-center border border-gray-300">
              <thead>
                <tr className="bg-gray-100 border-b border-gray-300">
                  <th className="px-4 py-2">Date</th>
                  <th className="px-4 py-2">Users</th>
                  <th className="px-4 py-2">Email</th>
                </tr>
              </thead>
              <tbody>
                {approvedUser.length > 0 ? (
                  approvedUser.map(user => (
                    <tr key={user.id} className="border-b border-gray-300">
                      <td className="px-4 py-2">{formatDate(user.created_at)}</td>
                      <td className="px-4 py-2">
                        {user.first_name} {user.last_name}
                      </td>
                      <td className="px-4 py-2">
                        {user.email}
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
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}