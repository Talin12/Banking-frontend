import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AppLayout } from './components/layout/AppLayout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Register from './pages/Register';
import Transactions from './pages/Transactions';
import NextOfKin from './pages/NextOfKin';
import ProfilePhotos from './pages/ProfilePhotos';
import VirtualCards from './pages/VirtualCards';
import MoneyOperations from './pages/MoneyOperations';
import Activate from './pages/Activate';
import EditProfile from './pages/EditProfile';
import StaffDashboard from './pages/StaffDashboard';


function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-elite-black flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-2 border-gold border-t-transparent rounded-full animate-spin" />
          <p className="text-elite-text-muted text-sm">Loading...</p>
        </div>
      </div>
    );
  }
  return user ? children : <Navigate to="/login" />;
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/activate/:uid/:token" element={<Activate />} />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <Dashboard />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/edit-profile"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <EditProfile />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/transactions"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <Transactions />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/virtual-cards"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <VirtualCards />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/operations"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <MoneyOperations />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/next-of-kin"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <NextOfKin />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/upload-photos"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <ProfilePhotos />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/staff"
            element={
              <ProtectedRoute>
                <StaffDashboard />
              </ProtectedRoute>
            }
          />

          <Route path="/" element={<Navigate to="/dashboard" />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
