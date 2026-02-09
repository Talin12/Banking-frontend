import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchProfile();
  }, []);
  
  const fetchProfile = async () => {
    try {
      const response = await api.get('/profiles/my-profile/');
      // Handle potential response structures
      setProfile(response.data.profile || response.data);
    } catch (error) {
      console.error('Failed to fetch profile:', error);
      setError('Failed to load profile data.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '24px', marginBottom: '10px' }}>Loading...</div>
        </div>
      </div>
    );
  }

  // --- SMART COMPLETENESS CHECKS ---
  
  // 1. Check if Next of Kin exists
  const hasNextOfKin = profile?.next_of_kin && profile.next_of_kin.length > 0;
  
  // 2. Check if Photos are uploaded (Required by backend model for activation)
  // The serializer returns these *_url fields if the images exist
  const hasPhotos = profile?.photo_url && profile?.id_photo_url && profile?.signature_photo_url;

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
      {/* Header */}
      <div style={{ background: 'rgba(255,255,255,0.95)', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1 style={{ margin: 0, fontSize: '28px', color: '#333' }}>My Banking Dashboard</h1>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button 
              onClick={() => navigate('/next-of-kin')}
              style={{ 
                padding: '10px 24px', 
                background: '#3b82f6', 
                color: 'white', 
                border: 'none', 
                borderRadius: '8px', 
                cursor: 'pointer',
                fontSize: '16px',
                fontWeight: '500'
              }}
            >
              Next of Kin
            </button>
            <button 
              onClick={() => navigate('/transactions')}
              style={{ 
                padding: '10px 24px', 
                background: '#10b981', 
                color: 'white', 
                border: 'none', 
                borderRadius: '8px', 
                cursor: 'pointer',
                fontSize: '16px',
                fontWeight: '500'
              }}
            >
              Transactions
            </button>
            <button 
              onClick={logout}
              style={{ 
                padding: '10px 24px', 
                background: '#667eea', 
                color: 'white', 
                border: 'none', 
                borderRadius: '8px', 
                cursor: 'pointer',
                fontSize: '16px',
                fontWeight: '500'
              }}
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 20px' }}>
        
        {/* --- DYNAMIC ALERTS BASED ON MISSING DATA --- */}

        {/* Priority 1: Missing Next of Kin */}
        {!hasNextOfKin && (
          <div style={{ 
            background: '#fff7ed', 
            borderLeft: '4px solid #f97316',
            padding: '20px',
            borderRadius: '12px',
            marginBottom: '30px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            boxShadow: '0 4px 6px rgba(0,0,0,0.05)'
          }}>
            <div>
              <h4 style={{ margin: '0 0 5px 0', color: '#9a3412' }}>Action Required</h4>
              <p style={{ margin: 0, color: '#c2410c' }}>
                Please add a Next of Kin to proceed with account activation.
              </p>
            </div>
            <button 
              onClick={() => navigate('/next-of-kin')}
              style={{ 
                padding: '8px 16px', 
                background: '#f97316', 
                color: 'white', 
                border: 'none', 
                borderRadius: '6px', 
                cursor: 'pointer',
                fontWeight: '600'
              }}
            >
              Add Now
            </button>
          </div>
        )}

        {/* Priority 2: Missing Photos (Only shows if Kin is added but photos are missing) */}
        {hasNextOfKin && !hasPhotos && (
          <div style={{ 
            background: '#eff6ff', 
            borderLeft: '4px solid #3b82f6',
            padding: '20px',
            borderRadius: '12px',
            marginBottom: '30px',
            boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
             <div>
               <h4 style={{ margin: '0 0 5px 0', color: '#1e40af' }}>Pending Verification</h4>
               <p style={{ margin: 0, color: '#1e3a8a' }}>
                 Next of Kin added! To finish activating your bank account, please upload your <strong>Profile Photo</strong>, <strong>ID Document</strong>, and <strong>Signature</strong>.
               </p>
             </div>
             <button 
                onClick={() => navigate('/upload-photos')} 
                style={{ 
                  padding: '8px 16px', 
                  background: '#3b82f6', 
                  color: 'white', 
                  border: 'none', 
                  borderRadius: '6px', 
                  cursor: 'pointer',
                  fontWeight: '600',
                  whiteSpace: 'nowrap',
                  marginLeft: '20px'
                }}
              >
                Upload Docs
              </button>
          </div>
        )}

        {/* Welcome Card */}
        <div style={{ 
          background: 'white', 
          borderRadius: '16px', 
          padding: '32px', 
          marginBottom: '30px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
        }}>
          <h2 style={{ margin: '0 0 8px 0', fontSize: '32px', color: '#333' }}>
            Welcome back, {profile?.first_name || user?.first_name || 'User'}! 👋
          </h2>
          <p style={{ margin: 0, color: '#666', fontSize: '18px' }}>{user?.email}</p>
        </div>

        {error && (
          <div style={{ 
            background: '#fee', 
            color: '#c33', 
            padding: '20px', 
            borderRadius: '12px',
            marginBottom: '30px',
            border: '1px solid #fcc'
          }}>
            {error}
          </div>
        )}

        {/* Profile Overview */}
        <div style={{ 
          background: 'white', 
          borderRadius: '16px', 
          padding: '32px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ margin: '0 0 24px 0', fontSize: '24px', color: '#333' }}>Profile Information</h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
            <InfoCard label="Full Name" value={profile?.full_name || 'N/A'} />
            <InfoCard label="Username" value={profile?.username || 'N/A'} />
            <InfoCard label="Email" value={profile?.email || 'N/A'} />
            <InfoCard label="Phone Number" value={profile?.phone_number || 'N/A'} />
            <InfoCard label="Country" value={profile?.country || 'N/A'} />
            <InfoCard label="City" value={profile?.city || 'N/A'} />
            <InfoCard label="Account Type" value={formatAccountType(profile?.account_type)} />
            <InfoCard label="Account Currency" value={formatCurrency(profile?.account_currency)} />
            
            {/* Status Indicators */}
            <InfoCard 
              label="Next of Kin Status" 
              value={hasNextOfKin ? "✅ Added" : "❌ Pending"} 
            />
             <InfoCard 
              label="Documents Status" 
              value={hasPhotos ? "✅ Uploaded" : "❌ Pending"} 
            />
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Helper Components ---

const InfoCard = ({ label, value }) => (
  <div style={{ 
    padding: '20px', 
    background: '#f8f9fa', 
    borderRadius: '12px',
    border: '1px solid #e9ecef'
  }}>
    <div style={{ fontSize: '12px', color: '#888', marginBottom: '8px', textTransform: 'uppercase', fontWeight: '600' }}>
      {label}
    </div>
    <div style={{ fontSize: '18px', color: '#333', fontWeight: '500' }}>
      {value}
    </div>
  </div>
);

const formatAccountType = (type) => {
  if (!type) return 'N/A';
  return type.charAt(0).toUpperCase() + type.slice(1);
};

const formatCurrency = (currency) => {
  if (!currency) return 'N/A';
  const currencyMap = {
    'us_dollar': 'US Dollar ($)',
    'pound_sterling': 'Pound Sterling (£)',
    'kenya_shilling': 'Kenya Shilling (KES)'
  };
  return currencyMap[currency] || currency;
};

export default Dashboard;