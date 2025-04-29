import { Navigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore.ts'; // your zustand store

export const ProtectedRoute = ({ element, requiredRole = null }: { element: JSX.Element, requiredRole?: string | null }) => {
    const { user } = useAuthStore();

    // If not authenticated, redirect to login
    if (!user.isAuthenticated) {
        return <Navigate to="/" replace />;
    }

    // If role is required, fetch it from the backend (or from zustand if you already store it)
    if (requiredRole && user.role !== requiredRole) {
        return <Navigate to="/dashboard" replace />; // Redirect to fallback page
    }

    return element;
};
