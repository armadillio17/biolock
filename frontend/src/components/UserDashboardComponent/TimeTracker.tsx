import { useState, useEffect } from 'react';
import { Clock, Bell } from 'lucide-react';

interface TimeTrackerProps {
  clockInTime: Date | null;
  clockOutTime: Date | null;
  isTracking: boolean;
}

export default function TimeTracker({ clockInTime, clockOutTime, isTracking }: TimeTrackerProps) {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [elapsedTime, setElapsedTime] = useState(0);

  // Calculate total work time if clockOutTime exists
  const calculateTotalWorkTime = () => {
    if (!clockInTime || !clockOutTime) return 0;

    return Math.floor((clockOutTime.getTime() - clockInTime.getTime()) / 1000);
  };

  const totalWorkTimeInSeconds = calculateTotalWorkTime();

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setCurrentTime(now);

      if (isTracking && clockInTime) {
        const elapsed = Math.floor((now.getTime() - clockInTime.getTime()) / 1000);
        setElapsedTime(elapsed);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [isTracking, clockInTime]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDateTime = (date: Date) => {
    return date.toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      // second: '2-digit'
    });
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8 border border-slate-200">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-blue-100 rounded-xl">
            <Clock className="w-6 h-6 text-blue-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800">Time Tracking</h2>
        </div>
        <div className="flex items-center space-x-2 text-slate-600">
          <Bell className="w-4 h-4" />
          <span className="text-sm font-medium">{formatDateTime(currentTime)}</span>
        </div>
      </div>

      {/* Timer Display */}
      <div className="text-center mb-8">
        <div className="bg-gradient-to-r from-slate-50 to-slate-100 rounded-2xl p-8 mb-6">
          <div className="text-6xl font-mono font-bold text-slate-800 mb-2">
            {clockOutTime
              ? formatTime(totalWorkTimeInSeconds)
              : isTracking
              ? formatTime(elapsedTime)
              : '00:00:00'}
          </div>
          <p className="text-slate-600 font-medium">
            {clockOutTime
              ? 'Total Work Time'
              : isTracking
              ? 'Time Elapsed'
              : 'Ready to Start'}
          </p>
        </div>

        {/* Status Information */}
        {clockInTime && (
          <div
            className={`${
              clockOutTime ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'
            } border rounded-xl p-4 mb-6`}
          >
            <p className={clockOutTime ? 'text-red-800 font-medium' : 'text-green-800 font-medium'}>
              {clockOutTime ? 'Clocked Out At' : 'Clocked In At'}:{' '}
              {new Date(clockOutTime || clockInTime).toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
                // second: '2-digit'
              })}
            </p>
            <p className={clockOutTime ? 'text-red-600 text-sm mt-1' : 'text-green-600 text-sm mt-1'}>
              {formatDateTime(clockOutTime || clockInTime)}
            </p>
          </div>
        )}
      </div>

      {/* Today's Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-center">
          {/* <div className="text-2xl font-bold text-blue-600">8.5h</div> */}
          <div className="text-2xl font-bold text-green-600">
            {clockOutTime
              ? `${(totalWorkTimeInSeconds / 3600).toFixed(1)}h`
              : isTracking
              ? `${(elapsedTime / 3600).toFixed(1)}h`
              : '0.0h'}
          </div>
          <div className="text-blue-800 text-sm font-medium">Target Hours</div>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-green-600">
            {clockOutTime
              ? `${(totalWorkTimeInSeconds / 3600).toFixed(1)}h`
              : isTracking
              ? `${(elapsedTime / 3600).toFixed(1)}h`
              : '0.0h'}
          </div>
          <div className="text-green-800 text-sm font-medium">Hours Today</div>
        </div>
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 text-center">
          {/* <div className="text-2xl font-bold text-orange-600">42.5h</div> */}
          <div className="text-2xl font-bold text-green-600">
            {clockOutTime
              ? `${(totalWorkTimeInSeconds / 3600).toFixed(1)}h`
              : isTracking
              ? `${(elapsedTime / 3600).toFixed(1)}h`
              : '0.0h'}
          </div>
          <div className="text-orange-800 text-sm font-medium">This Week</div>
        </div>
      </div>
    </div>
  );
}