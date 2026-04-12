import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Skeleton } from '@/components/ui/skeleton';

const ProtectedRoute: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center p-8">
        <div className="w-full max-w-7xl h-full flex gap-8">
          <Skeleton className="w-64 h-full hidden md:block" />
          <div className="flex-1 flex flex-col gap-8">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="flex-1 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
