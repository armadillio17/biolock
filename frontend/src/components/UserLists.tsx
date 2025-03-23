import { useState } from 'react';
import DashboardLayout from "@/layouts/DashboardLayout"
import { Button } from "./ui/button"

export default function UserLists() {

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