import React, { useEffect, useRef, useState } from 'react';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useAttendanceStore } from '../store/adminAttendanceStore';

export const SearchBar: React.FC = () => {
  const { searchQuery, setSearchQuery, fetchAttendance } = useAttendanceStore();
  const [localQuery, setLocalQuery] = useState(searchQuery);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const previousQueryRef = useRef<string>(searchQuery);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setLocalQuery(val);
    setSearchQuery(val);
  };

  const handleClear = () => {
    setLocalQuery('');
    setSearchQuery('');
    fetchAttendance(1, '');
  };

  // Debounced fetchAttendance
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(() => {
      // Only fetch if the query actually changed
      if (previousQueryRef.current !== localQuery) {
        previousQueryRef.current = localQuery;
        fetchAttendance(1, localQuery);
      }
    }, 300);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [fetchAttendance, localQuery]);

  return (
    <div className="relative w-full max-w-sm">
      <Search className="absolute w-4 h-4 -translate-y-1/2 left-3 top-1/2 text-muted-foreground" />
      <Input
        placeholder="Search by name, date, or status..."
        value={localQuery}
        onChange={handleChange}
        className="overflow-hidden border border-gray-200 pl-9 pr-9 rounded-xl bg-white/70 backdrop-blur-sm"
      />
      {localQuery && (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleClear}
          className="absolute p-0 -translate-y-1/2 right-1 top-1/2 h-7 w-7 hover:bg-transparent"
        >
          <X className="w-4 h-4" />
        </Button>
      )}
    </div>
  );
};
