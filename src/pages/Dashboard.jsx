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
      // Handle potential response structures (nested vs direct)
      setProfile(response.data.profile?.data || response.data.profile || response.data);
    } catch (error) {
      console.error('Failed to fetch profile:', error);
      setError('Failed to load profile data.');
    } finally {
      setLoading(false);
    }
  };

  // Image Helper Component
  const ImageDisplay = ({ src, alt, size = 'medium', shape = 'square' }) => {
    if (!src) return null;
    const sizeStyles = {
      small: { width: '80px', height: '80px' },
      medium: { width: '120px', height: '80px' },
      large: { width: '200px', height: '150px' }
    };
    const shapeStyles = {
      square: { borderRadius: '8px', objectFit: 'cover' },
      circle: { borderRadius: '50%', objectFit: 'cover' },
      signature: { borderRadius: '8px', objectFit: 'contain' }
    };
    return (
      <img 
        src={src}
        alt={alt}
        style={{
          ...sizeStyles[size],
          ...shapeStyles[shape],
          border: '2px solid #10b981',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          background: '#f8fafc'
        }}
        onError={(e) => { e.target.style.display = 'none'; }}
      />
    );
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

  // --- COMPLETENESS CHECKS ---
  const hasNextOfKin = profile?.next_of_kin && profile.next_of_kin.length > 0;
  const hasPhotos = profile?.photo_url && profile?.id_photo_url && profile?.signature_photo_url;

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
      {/* Header */}
      <div style={{ background: 'rgba(255,255,255,0.95)', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
          <h1 style={{ margin: 0, fontSize: '28px', color: '#333' }}>My Banking Dashboard</h1>
          
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            {/* NEW: Money Operations Button */}
            <button 
              onClick={() => navigate('/operations')}
              style={{ padding: '10px 20px', background: '#f59e0b', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '500' }}
            >
              Transfer / Pay
            </button>

            {/* NEW: Virtual Cards Button */}
            <button 
              onClick={() => navigate('/virtual-cards')}
              style={{ padding: '10px 20px', background: '#8b5cf6', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '500' }}
            >
              Virtual Cards
            </button>

            <button 
              onClick={() => navigate('/transactions')}
              style={{ padding: '10px 20px', background: '#10b981', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '500' }}
            >
              Transactions
            </button>

            <button 
              onClick={() => navigate('/next-of-kin')}
              style={{ padding: '10px 20px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '500' }}
            >
              Next of Kin
            </button>

            <button 
              onClick={logout}
              style={{ padding: '10px 20px', background: '#667eea', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '500' }}
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 20px' }}>
        
        {/* --- DYNAMIC ALERTS --- */}
        {!hasNextOfKin && (
          <div style={{ background: '#fff7ed', borderLeft: '4px solid #f97316', padding: '20px', borderRadius: '12px', marginBottom: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h4 style={{ margin: '0 0 5px 0', color: '#9a3412' }}>Action Required</h4>
              <p style={{ margin: 0, color: '#c2410c' }}>Please add a Next of Kin to proceed with account activation.</p>
            </div>
            <button onClick={() => navigate('/next-of-kin')} style={{ padding: '8px 16px', background: '#f97316', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}>Add Now</button>
          </div>
        )}

        {hasNextOfKin && !hasPhotos && (
          <div style={{ background: '#eff6ff', borderLeft: '4px solid #3b82f6', padding: '20px', borderRadius: '12px', marginBottom: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
             <div>
               <h4 style={{ margin: '0 0 5px 0', color: '#1e40af' }}>Pending Verification</h4>
               <p style={{ margin: 0, color: '#1e3a8a' }}>Please upload your <strong>Profile Photo</strong>, <strong>ID Document</strong>, and <strong>Signature</strong>.</p>
             </div>
             <button onClick={() => navigate('/upload-photos')} style={{ padding: '8px 16px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}>Upload Docs</button>
          </div>
        )}

        {/* Welcome Card */}
        <div style={{ background: 'white', borderRadius: '16px', padding: '32px', marginBottom: '30px', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}>
          <h2 style={{ margin: '0 0 8px 0', fontSize: '32px', color: '#333' }}>
            Welcome back, {profile?.first_name || user?.first_name || 'User'}! 👋
          </h2>
          <p style={{ margin: 0, color: '#666', fontSize: '18px' }}>{user?.email}</p>
          
          {/* Profile Image Display */}
          {profile?.photo_url && (
            <div style={{ marginTop: '20px', display: 'flex', alignItems: 'center', gap: '15px' }}>
              <ImageDisplay src={profile.photo_url} alt="Profile Photo" size="large" shape="circle" />
              <div>
                <div style={{ color: '#10b981', fontSize: '14px', fontWeight: '600' }}>Profile Verified ✓</div>
                <div style={{ color: '#6b7280', fontSize: '14px' }}>Account active</div>
              </div>
            </div>
          )}
        </div>

        {error && (
          <div style={{ background: '#fee', color: '#c33', padding: '20px', borderRadius: '12px', marginBottom: '30px', border: '1px solid #fcc' }}>{error}</div>
        )}

        {/* Profile Overview */}
        <div style={{ background: 'white', borderRadius: '16px', padding: '32px', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}>
          <h3 style={{ margin: '0 0 24px 0', fontSize: '24px', color: '#333' }}>Profile Information</h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
            <InfoCard label="Full Name" value={profile?.full_name || 'N/A'} />
            <InfoCard label="Account Number" value={profile?.account_number || 'N/A'} />
            <InfoCard label="Username" value={profile?.username || 'N/A'} />
            <InfoCard label="Email" value={profile?.email || 'N/A'} />
            <InfoCard label="Phone Number" value={profile?.phone_number || 'N/A'} />
            <InfoCard label="City/Country" value={`${profile?.city || '-'}, ${profile?.country || '-'}`} />
            <InfoCard label="Account Type" value={formatAccountType(profile?.account_type)} />
            <InfoCard label="Currency" value={formatCurrency(profile?.account_currency)} />
            <InfoCard label="Next of Kin" value={hasNextOfKin ? "✅ Added" : "❌ Pending"} />
            <InfoCard label="Documents" value={hasPhotos ? "✅ Uploaded" : "❌ Pending"} />
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper Components
const InfoCard = ({ label, value }) => (
  <div style={{ padding: '20px', background: '#f8f9fa', borderRadius: '12px', border: '1px solid #e9ecef' }}>
    <div style={{ fontSize: '12px', color: '#888', marginBottom: '8px', textTransform: 'uppercase', fontWeight: '600' }}>{label}</div>
    <div style={{ fontSize: '18px', color: '#333', fontWeight: '500', wordBreak: 'break-word' }}>{value}</div>
  </div>
);

const formatAccountType = (type) => type ? type.charAt(0).toUpperCase() + type.slice(1) : 'N/A';
const formatCurrency = (currency) => {
  const map = { 'us_dollar': 'USD ($)', 'pound_sterling': 'GBP (£)', 'kenya_shilling': 'KES' };
  return map[currency] || currency || 'N/A';
};

export default Dashboard;