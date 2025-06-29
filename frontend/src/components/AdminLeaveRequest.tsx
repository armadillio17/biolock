import { useState, useEffect, useMemo } from "react";
import { Search, Calendar, Clock, Users, Filter } from "lucide-react";
import DashboardLayout from "@/layouts/DashboardLayout";
import { Button } from "./ui/button";
// import { Calendar as CalendarComponent } from "@/components/LeaveRequestCalendarComponent";
import LeaveRequestModal from "./UserPrompt/LeaveRequestPrompt";
import { leaveRequestStore } from '@/store/leaveRequestStore';
import { useAuthStore } from '@/store/authStore';

type ViewMode = 'all' | 'today' | 'upcoming';

export default function LeaveRequest() {
  const { leaveRequest, fetchLeaveRequest, updateLeaveRequest, isLoading } = leaveRequestStore();
  const { user } = useAuthStore();

  // State management
  // const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('all');
  const [updatingRequests, setUpdatingRequests] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchLeaveRequest();
  }, [fetchLeaveRequest]);

  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => {
    setIsModalOpen(false);
    fetchLeaveRequest();
  };

  // const handleDateSelect = (date: string) => setSelectedDate(date);

  // Enhanced update function with optimistic updates
  const handleUpdateLeaveRequest = async (status: string, id: any) => {
    const requestId = String(id);
    setUpdatingRequests(prev => new Set(prev).add(requestId));

    try {
      await updateLeaveRequest(status, id);
    } catch (error) {
      console.error('Failed to update leave request:', error);
    } finally {
      setUpdatingRequests(prev => {
        const newSet = new Set(prev);
        newSet.delete(requestId);
        return newSet;
      });
    }
  };

  // Memoized filtered and sorted leave requests
  const filteredRequests = useMemo(() => {
    if (!Array.isArray(leaveRequest)) return [];

    let filtered = leaveRequest.filter((leave) => {
      const fullName = `${leave.user.first_name} ${leave.user.last_name}`.toLowerCase();
      const matchesSearch = fullName.includes(searchQuery.toLowerCase());

      return matchesSearch;
    });

    // Apply view mode filtering
    const today = new Date().toISOString().split('T')[0];

    switch (viewMode) {
      case 'today':
        filtered = filtered.filter(leave =>
          leave.start_date <= today && leave.end_date >= today
        );
        break;
      case 'upcoming':
        filtered = filtered.filter(leave =>
          leave.start_date > today
        );
        break;
      default:
        // 'all' - no additional filtering
        break;
    }

    // Sort by start date (most recent first)
    return filtered.sort((a, b) => new Date(b.start_date).getTime() - new Date(a.start_date).getTime());
  }, [leaveRequest, searchQuery, viewMode]);

  // Calendar data preparation
  // const leaveRequestsByDate: Record<string, { status: string | null }[]> = useMemo(() => {
  //   const dateMap: Record<string, { status: string | null }[]> = {};

  //   if (Array.isArray(leaveRequest)) {
  //     leaveRequest.forEach((leave) => {
  //       const start = new Date(leave.start_date);
  //       const end = new Date(leave.end_date);

  //       // Add status for each date in the range
  //       for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
  //         const dateStr = d.toISOString().split('T')[0];
  //         if (!dateMap[dateStr]) {
  //           dateMap[dateStr] = [];
  //         }
  //         dateMap[dateStr].push({ status: leave.status });
  //       }
  //     });
  //   }

  //   return dateMap;
  // }, [leaveRequest]);

  // Stats calculation
  const stats = useMemo(() => {
    if (!Array.isArray(leaveRequest)) return { total: 0, pending: 0, approved: 0, upcoming: 0 };

    const today = new Date().toISOString().split('T')[0];

    return {
      total: leaveRequest.length,
      pending: leaveRequest.filter(leave => leave.status === 'pending').length,
      approved: leaveRequest.filter(leave => leave.status === 'approved').length,
      upcoming: leaveRequest.filter(leave => leave.start_date > today).length,
    };
  }, [leaveRequest]);

  const viewModeButtons = [
    { key: 'all' as ViewMode, label: 'All Requests', icon: Users },
    { key: 'today' as ViewMode, label: "Today's Leaves", icon: Calendar },
    { key: 'upcoming' as ViewMode, label: 'Upcoming', icon: Clock },
  ];

  return (
    <DashboardLayout>
      <div className="p-4 space-y-6 md:p-6">
        {/* Header with Stats */}
        <div className="flex flex-col gap-6 pb-6 border-b border-gray-200 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="mb-2 text-3xl font-bold text-gray-900">Leave Management</h1>
            <div className="flex flex-wrap gap-4 text-sm text-gray-600">
              <span className="flex items-center gap-1">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                Total: {stats.total}
              </span>
              <span className="flex items-center gap-1">
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                Pending: {stats.pending}
              </span>
              <span className="flex items-center gap-1">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                Approved: {stats.approved}
              </span>
              <span className="flex items-center gap-1">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                Upcoming: {stats.upcoming}
              </span>
            </div>
          </div>
          <Button
            variant="outline"
            className="inline-flex items-center justify-center h-10 px-5 py-2 overflow-hidden text-sm font-medium text-white border rounded-lg bg-gradient-to-r from-blue-500 to-teal-500"
            onClick={handleOpenModal}
          >
            Request Leave
          </Button>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col gap-4 md:flex-row">
          <div className="relative flex-1">
            <Search className="absolute w-5 h-5 text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
            <input
              type="text"
              placeholder="Search by employee name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full py-3 pl-10 pr-4 transition-colors border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="flex p-1 bg-gray-100 rounded-lg">
            {viewModeButtons.map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setViewMode(key)}
                className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${viewMode === key
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Calendar */}
        {/* <div className="p-6 border border-gray-200 shadow-lg bg-white/80 backdrop-blur-sm rounded-xl">
          <h2 className="flex items-center gap-2 mb-4 text-lg font-semibold text-gray-800">
            <Calendar className="w-5 h-5" />
            Leave Calendar
          </h2>
          <CalendarComponent onDateSelect={handleDateSelect} leaveRequestsByDate={leaveRequestsByDate} />
        </div> */}

        {/* Leave Requests Table */}
        <div className="overflow-hidden border border-gray-200 shadow-lg bg-white/80 backdrop-blur-sm rounded-xl">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-800">
              <Filter className="w-5 h-5" />
              {viewMode === 'all' && 'All Leave Requests'}
              {viewMode === 'today' && "Today's Leave Requests"}
              {viewMode === 'upcoming' && 'Upcoming Leave Requests'}
              <span className="text-sm font-normal text-gray-500">({filteredRequests.length})</span>
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-4 text-sm font-semibold text-left text-gray-700">Employee</th>
                  <th scope="col" className="px-6 py-4 text-sm font-semibold text-left text-gray-700">Type</th>
                  <th scope="col" className="px-6 py-4 text-sm font-semibold text-left text-gray-700">Start Date</th>
                  <th scope="col" className="px-6 py-4 text-sm font-semibold text-left text-gray-700">End Date</th>
                  <th scope="col" className="px-6 py-4 text-sm font-semibold text-left text-gray-700">Duration</th>
                  <th scope="col" className="px-6 py-4 text-sm font-semibold text-left text-gray-700">Reason</th>
                  <th scope="col" className="px-6 py-4 text-sm font-semibold text-center text-gray-700">Status/Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {isLoading ? (
                  [...Array(5)].map((_, index) => (
                    <tr key={index} className="animate-pulse">
                      <td className="px-6 py-4"><div className="w-3/4 h-4 bg-gray-200 rounded"></div></td>
                      <td className="px-6 py-4"><div className="w-1/2 h-4 bg-gray-200 rounded"></div></td>
                      <td className="px-6 py-4"><div className="w-1/3 h-4 bg-gray-200 rounded"></div></td>
                      <td className="px-6 py-4"><div className="w-1/3 h-4 bg-gray-200 rounded"></div></td>
                      <td className="px-6 py-4"><div className="w-1/4 h-4 bg-gray-200 rounded"></div></td>
                      <td className="px-6 py-4"><div className="w-2/3 h-4 bg-gray-200 rounded"></div></td>
                      <td className="px-6 py-4"><div className="w-20 h-8 mx-auto bg-gray-200 rounded"></div></td>
                    </tr>
                  ))
                ) : filteredRequests.length > 0 ? (
                  filteredRequests.map((leave) => {
                    const startDate = new Date(leave.start_date);
                    const endDate = new Date(leave.end_date);
                    const duration = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
                    const isUpdating = updatingRequests.has(String(leave.id));

                    return (
                      <tr key={String(leave.id)} className="transition-colors duration-150 hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className="flex items-center justify-center w-8 h-8 text-sm font-medium text-white rounded-full bg-gradient-to-r from-blue-500 to-purple-500">
                              {leave.user.first_name.charAt(0)}{leave.user.last_name.charAt(0)}
                            </div>
                            <div className="ml-3">
                              <div className="text-sm font-medium text-gray-900">
                                {leave.user.first_name} {leave.user.last_name}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex px-2 py-1 text-xs font-medium text-blue-800 bg-blue-100 rounded-full">
                            {leave.type}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {new Date(leave.start_date).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {new Date(leave.end_date).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {duration} day{duration !== 1 ? 's' : ''}
                        </td>
                        <td className="max-w-xs px-6 py-4 text-sm text-gray-600 truncate" title={leave.details}>
                          {leave.details}
                        </td>
                        <td className="px-6 py-4 text-center">
                          {leave.status === 'pending' && leave.user.id !== Number(user.userId) ? (
                            <div className="flex justify-center space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                disabled={isUpdating}
                                className="text-green-600 border-green-300 hover:bg-green-50 disabled:opacity-50"
                                onClick={() => handleUpdateLeaveRequest("approved", leave.id)}
                              >
                                {isUpdating ? '...' : 'Approve'}
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                disabled={isUpdating}
                                className="text-red-600 border-red-300 hover:bg-red-50 disabled:opacity-50"
                                onClick={() => handleUpdateLeaveRequest("declined", leave.id)}
                              >
                                {isUpdating ? '...' : 'Decline'}
                              </Button>
                            </div>
                          ) : (
                            <span className={`inline-flex px-3 py-1 text-xs font-medium rounded-full capitalize ${leave.status === 'approved'
                                ? 'bg-green-100 text-green-800'
                                : leave.status === 'declined'
                                  ? 'bg-red-100 text-red-800'
                                  : 'bg-yellow-100 text-yellow-800'
                              }`}>
                              {leave.status}
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center justify-center text-gray-500">
                        <Users className="w-12 h-12 mb-4 text-gray-300" />
                        <p className="text-lg font-medium">No leave requests found</p>
                        <p className="text-sm">
                          {searchQuery
                            ? `No requests match "${searchQuery}"`
                            : `No ${viewMode === 'all' ? '' : viewMode} leave requests at this time`
                          }
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <LeaveRequestModal isOpen={isModalOpen} onClose={handleCloseModal} />
    </DashboardLayout>
  );
}