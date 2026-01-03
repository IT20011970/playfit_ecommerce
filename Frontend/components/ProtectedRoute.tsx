
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';

export const ProtectedRoute: React.FC = () => {
  const { isAdmin } = useAppContext();

  if (!isAdmin) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};
