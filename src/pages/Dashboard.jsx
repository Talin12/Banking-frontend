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
      setProfile(response.data.profile?.data || response.data.profile || response.data);
    } catch (error) {
      console.error('Failed to fetch profile:', error);
      setError('Failed to load profile data.');
    } finally {
      setLoading(false);
    }
  };

  // Image display component (NEW)
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
        onError={(e) => {
          e.target.style.display = 'none';
        }}
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

  // Check completeness
  const hasNextOfKin = profile?.next_of_kin && profile.next_of_kin.length > 0;
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
        
        {/* Alerts */}
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
                 Next of Kin added! Please upload your <strong>Profile Photo</strong>, <strong>ID Document</strong>, and <strong>Signature</strong>.
               </p>
             </div>
             <button 
                onClick={() => navigate('/profile-photos')} 
                style={{ 
                  padding: '8px 16px', 
                  background: '#3b82f6', 
                  color: 'white', 
                  border: 'none', 
                  borderRadius: '6px', 
                  cursor: 'pointer',
                  fontWeight: '600'
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
          
          {/* ✅ NEW: Profile Image in Welcome Card */}
          {profile?.photo_url && (
            <div style={{ marginTop: '20px', display: 'flex', alignItems: 'center', gap: '15px' }}>
              <ImageDisplay 
                src={profile.photo_url} 
                alt="Profile Photo" 
                size="large" 
                shape="circle" 
              />
              <div>
                <div style={{ color: '#10b981', fontSize: '14px', fontWeight: '600' }}>Profile Verified ✓</div>
                <div style={{ color: '#6b7280', fontSize: '14px' }}>Your photo is successfully uploaded</div>
              </div>
            </div>
          )}
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

        {/* ✅ NEW: Verification Documents Section */}
        {hasNextOfKin && (
          <div style={{ 
            background: 'white', 
            borderRadius: '16px', 
            padding: '32px',
            marginBottom: '30px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
          }}>
            <h3 style={{ margin: '0 0 24px 0', fontSize: '24px', color: '#333' }}>Verification Documents</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
              
              {/* Profile Photo */}
              <div style={{ padding: '24px', background: '#f0fdf4', borderRadius: '12px', border: '2px solid #dcfce7' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                  <div style={{ width: '8px', height: '8px', background: '#16a34a', borderRadius: '50%' }} />
                  <strong style={{ fontSize: '16px', color: '#166534' }}>Profile Photo</strong>
                </div>
                {profile?.photo_url ? (
                  <ImageDisplay src={profile.photo_url} alt="Profile" size="large" shape="circle" />
                ) : (
                  <div style={{ height: '150px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f3f4f6', borderRadius: '12px', color: '#9ca3af' }}>
                    No photo uploaded
                  </div>
                )}
              </div>

              {/* ID Document */}
              <div style={{ padding: '24px', background: '#eff6ff', borderRadius: '12px', border: '2px solid #dbeafe' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                  <div style={{ width: '8px', height: '8px', background: '#2563eb', borderRadius: '50%' }} />
                  <strong style={{ fontSize: '16px', color: '#1e40af' }}>ID Document</strong>
                </div>
                {profile?.id_photo_url ? (
                  <ImageDisplay src={profile.id_photo_url} alt="ID Document" size="large" />
                ) : (
                  <div style={{ height: '150px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f3f4f6', borderRadius: '12px', color: '#9ca3af' }}>
                    No ID uploaded
                  </div>
                )}
              </div>

              {/* Signature */}
              <div style={{ padding: '24px', background: '#fdf4ff', borderRadius: '12px', border: '2px solid #f3e8ff' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                  <div style={{ width: '8px', height: '8px', background: '#9333ea', borderRadius: '50%' }} />
                  <strong style={{ fontSize: '16px', color: '#7c3aed' }}>Signature</strong>
                </div>
                {profile?.signature_photo_url ? (
                  <ImageDisplay src={profile.signature_photo_url} alt="Signature" size="large" shape="signature" />
                ) : (
                  <div style={{ height: '150px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f3f4f6', borderRadius: '12px', color: '#9ca3af' }}>
                    No signature uploaded
                  </div>
                )}
              </div>
            </div>
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
            <InfoCard label="Next of Kin Status" value={hasNextOfKin ? "✅ Added" : "❌ Pending"} />
            <InfoCard label="Documents Status" value={hasPhotos ? "✅ Complete" : "❌ Pending"} />
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper Components (unchanged)
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