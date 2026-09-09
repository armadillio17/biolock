import { createBrowserRouter } from 'react-router-dom';
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';
import Dashboard from './pages/Dashboard';
import LeaveRequests from './pages/LeaveRequest';
import Timesheet from './pages/Timesheet';
import OvertimeRequest from './components/UserOvertimeRequest';
// import ViewEvents from './pages/ViewEvents';
import AdminEventList from './pages/AdminEvent';
import SystemLogs from './components/AdminActivityLog';
import UserList from './pages/UserList';
import DepartmentView from './pages/DepartmentView';
import AdminReport from './pages/AdminReport';
import { ProtectedRoute } from './ProtectedRoutes';
import MessagePage from './pages/Messages'
import Payroll from './pages/Payroll';
import PositionView from './pages/PositionView';
import LocationView from './pages/LocationView';
import Reminders from './pages/Reminders';

export const router = createBrowserRouter([
    {
        path: '/',
        element: <SignIn />,
    },
    {
        path: '/sign-up',
        element: <SignUp />,
    },
    {
        path: '/dashboard',
        element: <ProtectedRoute element={<Dashboard />} />,
    },
    {
        path: '/reminders',
        element: <ProtectedRoute element={<Reminders />} />,
    },
    {
        path: '/events',
        element: <ProtectedRoute element={<AdminEventList />} requiredRole="admin" />,
    },
    // {
    //     path: '/events/:id',
    //     element: <ProtectedRoute element={<ViewEvents />} />,
    // },
    {
        path: '/leave-request',
        element: <ProtectedRoute element={<LeaveRequests />} />,
    },
    {
        path: '/timesheet',
        element: <ProtectedRoute element={<Timesheet />} />,
    },
    {
        path: '/overtime',
        element: <ProtectedRoute element={<OvertimeRequest />} />,
    },
    {
        path: '/reports',
        element: <ProtectedRoute element={<AdminReport />} requiredRole="admin" />,
    },
    {
        path: '/users',
        element: <ProtectedRoute element={<UserList />} requiredRole="admin" />,
    },
    {
        path: '/department',
        element: <ProtectedRoute element={<DepartmentView />} requiredRole="admin" />,
    },
    {
        path: '/activity-logs',
        element: <ProtectedRoute element={<SystemLogs />} requiredRole="admin" />,
    },
    {
        path: '/payroll',
        element: <ProtectedRoute element={<Payroll />} requiredRole="admin" />,
    },
    {
        path: '/inbox',
        element: <ProtectedRoute element={<MessagePage />} />,
    },
    {
        path: '/position',
        element: <ProtectedRoute element={<PositionView />} />,
    },
    {
        path: '/locations',
        element: <ProtectedRoute element={<LocationView />} requiredRole="admin" />,
    },
]);