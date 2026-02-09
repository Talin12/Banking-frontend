import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const [profile, setProfile] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchProfile();
  }, []);
  
  const fetchProfile = async () => {
    try {
      const response = await api.get('/profiles/my-profile/');
      setProfile(response.data);
      if (response.data.accounts) {
        setAccounts(response.data.accounts);
      }
    } catch (error) {
      console.error('Failed to fetch profile:', error);
      if (error.response?.status === 404) {
        setError('Profile not found. Please complete your profile setup.');
      } else {
        setError('Failed to load profile data.');
      }
    } finally {
      setLoading(false);
    }
  };
  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h1>Dashboard</h1>
        <button onClick={logout} style={{ padding: '8px 16px', cursor: 'pointer' }}>
          Logout
        </button>
      </div>

      <div style={{ background: '#f5f5f5', padding: '20px', borderRadius: '8px', marginBottom: '30px' }}>
        <h2>Welcome, {user?.first_name || user?.email}!</h2>
        <p>Email: {user?.email}</p>
      </div>

      {loading ? (
        <p>Loading profile...</p>
      ) : error ? (
        <div style={{ background: '#fff3cd', color: '#856404', padding: '15px', borderRadius: '8px' }}>
          <p>{error}</p>
        </div>
      ) : (
        <>
          <h2>Profile Information</h2>
          {profile && (
            <div style={{ background: 'white', padding: '20px', borderRadius: '8px', border: '1px solid #ddd', marginBottom: '30px' }}>
              <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                {JSON.stringify(profile, null, 2)}
              </pre>
            </div>
          )}

          <h2>My Accounts</h2>
          {accounts.length === 0 ? (
            <p>No accounts found. Contact support to create an account.</p>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
              {accounts.map((account) => (
                <div key={account.id} style={{ background: 'white', padding: '20px', borderRadius: '8px', border: '1px solid #ddd' }}>
                  <h3>{account.account_type}</h3>
                  <p><strong>Account Number:</strong> {account.account_number}</p>
                  <p><strong>Balance:</strong> {account.currency} {account.balance}</p>
                  <p><strong>Status:</strong> {account.is_active ? 'Active' : 'Inactive'}</p>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Dashboard;