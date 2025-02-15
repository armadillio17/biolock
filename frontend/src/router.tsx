import { createBrowserRouter } from 'react-router-dom';
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';
import Dashboard from './pages/Dashboard';

export const router = createBrowserRouter([
    {
        path: '/',
        element: <SignIn />,
    },
    {
        path: '/dashboard',
        element: <Dashboard />,
    },
    {
        path: '/sign-up',
        element: <SignUp />,
    },
]);