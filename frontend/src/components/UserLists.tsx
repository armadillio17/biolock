import DashboardLayout from "@/layouts/DashboardLayout"
import { Button } from "./ui/button"
import { useUserStore  } from "@/store/userlistStore";
import { useEffect } from 'react';

export default function UserLists() {

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
          <table className="min-w-full border border-gray-300 text-center">
            <thead>
              <tr className="border-b border-gray-300 bg-gray-100">
                <th className="py-2 px-4">Date</th>
                <th className="py-2 px-4">Users</th>
                <th className="py-2 px-4 w-1/3">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-gray-300">
                <td className="py-2 px-4">09-18-2025</td>
                <td className="py-2 px-4">Lorem Ipsum</td>
                <td className="py-2 px-4 w-1/3">
                  <Button className="bg-green-500 text-white px-4 py-1 rounded">Approve</Button>
                  <Button className="bg-red-500 text-white px-4 py-1 rounded ml-2">Decline</Button>
                </td>
              </tr>
              <tr className="border-b border-gray-300">
                <td className="py-2 px-4">09-18-2025</td>
                <td className="py-2 px-4">Lorem Ipsum</td>
                <td className="py-2 px-4 w-1/3">
                  <Button className="bg-green-500 text-white px-4 py-1 rounded">Approve</Button>
                  <Button className="bg-red-500 text-white px-4 py-1 rounded ml-2">Decline</Button>
                </td>
              </tr>
            </tbody>
          </table>
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
              {userList && userList.length > 0 ? (
                userList.map((user) => (
                  <tr key={user.id} className="border-b border-gray-300">
                    <td className="py-2 px-4">{new Date(user.created_at).toLocaleDateString()}</td>
                    <td className="py-2 px-4">{user.first_name} {user.last_name}</td>
                  </tr>
                ))
              ) : (
                <tr className="border-b border-gray-300">
                  <td colSpan={2} className="py-2 px-4 text-center">
                    {userList ? "No users found" : "Loading users..."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}