import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAttendanceStore } from '../store/adminAttendanceStore';

export const Pagination: React.FC = () => {
  const { 
    currentPage, 
    totalCount, 
    nextUrl, 
    prevUrl, 
    nextPage, 
    prevPage 
  } = useAttendanceStore();

  const recordsPerPage = 10;
  const totalPages = Math.ceil(totalCount / recordsPerPage);
  const startRecord = (currentPage - 1) * recordsPerPage + 1;
  const endRecord = Math.min(currentPage * recordsPerPage, totalCount);

  if (totalCount === 0) return null;

  return (
    <div className="flex items-center justify-between px-2">
      <div className="flex-1 text-sm text-muted-foreground">
        Showing {startRecord} to {endRecord} of {totalCount} results
      </div>
      <div className="flex items-center space-x-6 lg:space-x-8">
        <div className="flex items-center space-x-2">
          <p className="text-sm font-medium">
            Page {currentPage} of {totalPages}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            className="w-8 h-8 p-0 overflow-hidden border border-gray-200 shadow-md rounded-xl bg-white/70 backdrop-blur-sm"
            onClick={prevPage}
            disabled={!prevUrl}
          >
            <span className="sr-only">Go to previous page</span>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            className="w-8 h-8 p-0 overflow-hidden border border-gray-200 shadow-md rounded-xl bg-white/70 backdrop-blur-sm"
            onClick={nextPage}
            disabled={!nextUrl}
          >
            <span className="sr-only">Go to next page</span>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};