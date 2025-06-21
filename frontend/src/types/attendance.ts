export interface User {
  first_name: string;
  last_name: string;
}

export interface AttendanceRecord {
  id: number;
  user: User;
  date: string;
  clock_in: string;
  clock_out: string | null;
  working_hours: number;
  overtime_hours: number;
  status: string;
  scheduled_start: string | null;
  scheduled_end: string | null;
  is_clockOut: boolean;
  is_overtime_clock_in: boolean;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  holiday: number | null;
  custom_holiday: number | null;
}

export interface AttendanceResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: AttendanceRecord[];
}