import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

function ProtectedRoute({ children }) {
    const { user, loading } = useAuth();
    if (loading) return <div style={{ textAlign: 'center', marginTop: '50px' }}>Carregando...</div>;
    if (!user) return <Navigate to="/login" replace />;
    return children;
}

export default ProtectedRoute;