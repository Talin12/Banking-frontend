import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Register from './pages/Register';
import Transactions from './pages/Transactions';
import NextOfKin from './pages/NextOfKin'; 
import ProfilePhotos from './pages/ProfilePhotos';
import VirtualCards from './pages/VirtualCards';
import MoneyOperations from './pages/MoneyOperations'; 
import Activate from './pages/Activate';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) return <div>Loading...</div>;
  return user ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Protected Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/transactions"
            element={
              <ProtectedRoute>
                <Transactions />
              </ProtectedRoute>
            }
          />
          <Route
            path="/virtual-cards"
            element={
              <ProtectedRoute>
                <VirtualCards />
              </ProtectedRoute>
            }
          />
          <Route
            path="/operations" // New Route for Deposit/Withdraw/Transfer
            element={
              <ProtectedRoute>
                <MoneyOperations />
              </ProtectedRoute>
            }
          />
          <Route
            path="/next-of-kin"
            element={
              <ProtectedRoute>
                <NextOfKin />
              </ProtectedRoute>
            }
          />
          <Route
            path="/upload-photos"
            element={
              <ProtectedRoute>
                <ProfilePhotos />
              </ProtectedRoute>
            }
          />
          <Route path="/activate/:uid/:token" element={<Activate />} />
          <Route path="/" element={<Navigate to="/dashboard" />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;