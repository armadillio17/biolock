import { createBrowserRouter } from 'react-router-dom';
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';
import Dashboard from './pages/Dashboard';
import LeaveRequests from './pages/LeaveRequest';
import Timesheet from './pages/Timesheet';
import OvertimeRequest from './components/UserOvertimeRequest';
import ViewEvents from './pages/ViewEvents';
import AdminEventList from './pages/AdminEvent';
import AdminActivityLog from './components/AdminActivityLog';

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
        element: <Dashboard />,
    },
    {
        path: '/events',
        element: <AdminEventList />,
    },
    {
        path: '/events/:id',
        element: <ViewEvents />,
    },
    {
        path: '/leave-request',
        element: <LeaveRequests />,
    },
    {
        path: '/timesheet',
        element: <Timesheet />,
    },
    {
        path: '/overtime',
        element: <OvertimeRequest />,
    },
    {
        path: '/reports',
        // element: <Events />,
    },
    {
        path: '/users',
        // element: <Events />,
    },
    {
        path: '/activity-logs',

        element: <AdminActivityLog />,
    },
]);