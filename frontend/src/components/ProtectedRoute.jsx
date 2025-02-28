import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

function ProtectedRoute({ children, user, roleRequired }) {
  let location = useLocation();

  if (!user || user.rol !== roleRequired) {
    // Si no hay usuario logueado o el rol no coincide, redireccionar
    alert('Acceso denegado. Debes ser administrador.');
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  return children; // Si todo está correcto, renderiza el componente hijo
}
