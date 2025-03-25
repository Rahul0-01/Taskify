import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  if (!token) {
    alert("Please login first to access this page.");   // Add this line
    return <Navigate to="/login" replace />;
  }
  return children;
};

export default ProtectedRoute;
