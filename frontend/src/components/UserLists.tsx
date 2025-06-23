import { useEffect, useState } from "react";
import DashboardLayout from "@/layouts/DashboardLayout";
import { Button } from "./ui/button";
import { useUserStore } from "@/store/userlistStore";
import { Pencil } from "lucide-react";
import UserViewModal from "./ViewUserPrompt";
import SendRegistrationLinkModal from "./RegistrationLinkPrompt";
import { User } from "./ViewUserPrompt";

export default function UserLists() {
  const {
    newRegisteredUser,
    approvedUser,
    fetchNewUserList,
    fetchApprovedUserList,
    approvedRegisteredUser,
    declineRegisteredUser
  } = useUserStore();

  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [modalType, setModalType] = useState<"viewUser" | "sendLink" | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        await Promise.all([fetchNewUserList(), fetchApprovedUserList()]);
      } catch (err) {
        console.error("Failed to load user data:", err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [fetchNewUserList, fetchApprovedUserList]);

  const handleApprove = async (userId: number) => {
    setLoading(true);
    try {
      await approvedRegisteredUser(userId, true);
      await Promise.all([fetchNewUserList(), fetchApprovedUserList()]);
    } catch (err) {
      console.error("Error approving user:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDecline = async (userId: number) => {
    setLoading(true);
    try {
      await declineRegisteredUser(userId);
      await fetchNewUserList();
      await fetchApprovedUserList();
    } catch (err) {
      console.error("Error declining user:", err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr: string): string => {
    return new Date(dateStr).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const handleOpenUserModal = (user: User) => {
    setSelectedUser(user);
    setModalType("viewUser");
  };

  const handleOpenSendLinkModal = () => {
    setModalType("sendLink");
  };

  const handleCloseModal = () => {
    setModalType(null);
  };

  const handleSendLink = (email: string) => {
    console.log("Send link to:", email);
    handleCloseModal();
  };

  return (
    <DashboardLayout>
      <div className="p-4 md:p-6 space-y-6">
        <h1 className="text-2xl font-bold text-gray-800">Users</h1>

        {/* Registration Requests */}
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white/70 backdrop-blur-sm shadow-md">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <span className="font-semibold text-lg text-gray-800">Registration Requests</span>
            <Button
              variant="default"
              className="bg-blue-600 text-white hover:bg-blue-700"
              onClick={handleOpenSendLinkModal}
            >
              Send Registration Link
            </Button>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-3 text-left text-sm font-semibold text-gray-700"></th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Date</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Name</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Username</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Email</th>
                  <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  [...Array(3)].map((_, index) => (
                    <tr key={index}>
                      {[...Array(5)].map((__, i) => (
                        <td key={i} className="px-6 py-4 whitespace-nowrap">
                          <div className="h-4 bg-gray-200 rounded w-full animate-pulse"></div>
                        </td>
                      ))}
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="flex justify-end gap-2">
                          <div className="h-8 bg-green-200 rounded w-16 animate-pulse"></div>
                          <div className="h-8 bg-red-200 rounded w-16 animate-pulse"></div>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : newRegisteredUser.length > 0 ? (
                  newRegisteredUser.map((request) => (
                    <tr key={request.id} className="hover:bg-gray-50 transition-colors duration-150">
                      <td className="flex justify-center px-3 py-4 text-sm text-gray-600">{request.id}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{formatDate(request.created_at)}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{request.first_name} {request.last_name}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{request.username}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{request.email}</td>
                      <td className="px-6 py-4 text-right space-x-2 flex justify-end">
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-green-600 border-green-300 hover:bg-green-50"
                          onClick={() => handleApprove(request.id)}
                        >
                          Approve
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-600 border-red-300 hover:bg-red-50"
                          onClick={() => handleDecline(request.id)}
                        >
                          Decline
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-left text-gray-500">
                      No pending registration requests.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Approved Users Table */}
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white/70 backdrop-blur-sm shadow-md">
          <div className="px-6 py-4 border-b border-gray-200 font-semibold text-lg text-gray-800">
            Approved Users
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-3 text-left text-sm font-semibold text-gray-700"></th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Date</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Name</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Username</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Email</th>
                  <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  [...Array(3)].map((_, index) => (
                    <tr key={index}>
                      {[...Array(5)].map((__, i) => (
                        <td key={i} className="px-6 py-4 whitespace-nowrap">
                          <div className="h-4 bg-gray-200 rounded w-full animate-pulse"></div>
                        </td>
                      ))}
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="inline-block h-8 bg-gray-200 rounded w-8 animate-pulse"></div>
                      </td>
                    </tr>
                  ))
                ) : approvedUser.length > 0 ? (
                  approvedUser.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50 transition-colors duration-150">
                      <td className="flex justify-center px-3 py-4 text-sm text-gray-600">{user.id}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{formatDate(user.created_at)}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{user.first_name} {user.last_name}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{user.username}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{user.email}</td>
                      <td className="px-6 py-4 text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-blue-600 border-blue-300 hover:bg-blue-50"
                          onClick={() => handleOpenUserModal(user)}
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-left text-gray-500">
                      No approved users found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modals */}
      {modalType === "viewUser" && (
        <UserViewModal
          isOpen={true}
          onClose={handleCloseModal}
          user={selectedUser}
        />
      )}

      {modalType === "sendLink" && (
        <SendRegistrationLinkModal
          isOpen={true}
          onClose={handleCloseModal}
          onSend={handleSendLink}
        />
      )}
    </DashboardLayout>
  );
}
