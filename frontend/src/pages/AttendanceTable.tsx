import React, { useEffect } from 'react';
import { Clock, Calendar, RefreshCw, Users } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAttendanceStore } from '../store/adminAttendanceStore';
import { SearchBar } from '../components/SearchBar';
import { Pagination } from '../components/Pagination';
import DashboardLayout from '@/layouts/DashboardLayout';
import LoadingComponent from '@/components/LoadingUI'
export const AttendanceTable: React.FC = () => {
  const {
    filteredRecords,
    loading,
    error,
    totalCount,
    fetchAttendance,
    refreshData,
    searchQuery
  } = useAttendanceStore();

  const formatTime = (isoString: string) => {
    return new Date(isoString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const getStatusBadge = (record: any) => {
    if (record.is_overtime_clock_in) {
      return <Badge variant="overtime">Overtime</Badge>;
    }
    if (!record.is_clockOut) {
      return <Badge variant="active">Active</Badge>;
    }
    return <Badge variant="success">Completed</Badge>;
  };

  // Load initial data
  useEffect(() => {
    fetchAttendance();
  }, [fetchAttendance]);

  if (loading && filteredRecords.length === 0) {
    return (
      <DashboardLayout>
        <LoadingComponent />
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
      <div className="flex h-[450px] items-center justify-center">
        <div className="text-center">
          <div className="p-4 rounded-lg bg-destructive/15 text-destructive">
            <p className="font-medium">Error loading attendance data</p>
            <p className="mt-1 text-sm">{error}</p>
            <Button
              onClick={refreshData}
              variant="outline"
              className="mt-3"
            >
              Try Again
            </Button>
          </div>
        </div>
      </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="px-6 py-4 space-y-6 overflow-hidden border border-gray-200 shadow-md rounded-xl bg-white/70 backdrop-blur-sm">
      {/* Header */}
        <div className="flex items-center justify-between ">
        <div className="flex items-center space-x-2">
          <Users className="w-5 h-5 text-primary" />
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Timesheets</h2>
            <p className="text-muted-foreground">
              {totalCount} total records
            </p>
          </div>
        </div>
          <Button onClick={refreshData} disabled={loading} variant="outline" className='inline-flex items-center justify-center h-10 px-5 py-2 overflow-hidden text-sm font-medium text-white border rounded-lg bg-gradient-to-r from-blue-500 to-teal-500 '>
          <RefreshCw className={`mr-2 h-4 w-4  ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Search Bar */}
      <div className="flex items-center justify-between">
        <SearchBar />
        {searchQuery && (
          <p className="text-sm text-muted-foreground">
            {filteredRecords.length} result{filteredRecords.length !== 1 ? 's' : ''} found for &quot;{searchQuery}&quot;
          </p>
        )}
      </div>

      {/* Loading overlay for search/pagination */}
      <div className="relative">
        {loading && filteredRecords.length > 0 && (
          <div className="absolute inset-0 z-10 flex items-center justify-center rounded-md bg-background/50 backdrop-blur-sm">
              <RefreshCw className="w-6 h-6 overflow-hidden border border-gray-200 shadow-md animate-spin text-primary rounded-xl bg-white/70 backdrop-blur-sm" />
          </div>
        )}

        {/* Table */}
        <div className="">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Clock In</TableHead>
                <TableHead>Clock Out</TableHead>
                <TableHead>Regular Hours</TableHead>
                <TableHead>Overtime Hours</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRecords.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <Users className="w-8 h-8 text-muted-foreground/50" />
                      <p className="text-sm text-muted-foreground">
                        {searchQuery ? 'No records found matching your search.' : 'No attendance records available.'}
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredRecords.map((record) => (
                  <TableRow key={record.id} className="hover:bg-muted/50">
                    <TableCell className="font-medium">
                      <div className="flex items-center space-x-2">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10">
                          <span className="text-xs font-medium text-primary">
                            {record.user.first_name[0]}{record.user.last_name[0]}
                          </span>
                        </div>
                        <span>{record.user.first_name} {record.user.last_name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm">{formatDate(record.date)}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm">{formatTime(record.clock_in)}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm">
                          {record.clock_out ? formatTime(record.clock_out) : 'Active'}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="font-medium">{record.working_hours.toFixed(1)}h</span>
                    </TableCell>
                    <TableCell>
                      <span className={`font-medium ${record.overtime_hours > 0 ? 'text-orange-600' : ''}`}>
                        {record.overtime_hours.toFixed(1)}h
                      </span>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(record)}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Pagination */}
      {!searchQuery && <Pagination />}
      </div>
    </DashboardLayout>
  );
};