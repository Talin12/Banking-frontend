import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const ProfilePhotos = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Local state for file selections
  const [files, setFiles] = useState({
    photo: null,
    id_photo: null,
    signature_photo: null
  });

  // FETCH & DISPLAY EXISTING IMAGES + Preview state
  const [userProfile, setUserProfile] = useState(null);
  const [previews, setPreviews] = useState({
    photo: null,
    id_photo: null,
    signature_photo: null
  });

  // ✅ NEW: Fetch current profile images on load
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.get('/profiles/my-profile/');
        setUserProfile(response.data.data || response.data.profile.data);
      } catch (err) {
        console.log('No existing profile or fetch failed');
      }
    };
    fetchProfile();
  }, []);

  const handleFileChange = (e) => {
    const { name, files: selectedFiles } = e.target;
    if (selectedFiles && selectedFiles[0]) {
      const file = selectedFiles[0];
      setFiles(prev => ({ ...prev, [name]: file }));
      
      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviews(prev => ({ ...prev, [name]: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    const formData = new FormData();
    
    if (files.photo) formData.append('photo', files.photo);
    if (files.id_photo) formData.append('id_photo', files.id_photo);
    if (files.signature_photo) formData.append('signature_photo', files.signature_photo);

    if (!files.photo && !files.id_photo && !files.signature_photo) {
      setError("Please select at least one document to upload.");
      setLoading(false);
      return;
    }

    try {
      await api.patch('/profiles/my-profile/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      setSuccess('Documents uploaded successfully! Refreshing...');
      // Refresh profile data
      setTimeout(() => {
        window.location.reload();
      }, 1500);
      
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.detail || 'Failed to upload documents. Please ensure files are valid images.');
    } finally {
      setLoading(false);
    }
  };

  // ✅ NEW: Image display component
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
          border: '2px solid #e5e7eb',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}
        onError={(e) => {
          e.target.style.display = 'none';
        }}
      />
    );
  };

  return (
    <div style={{ padding: '40px 20px', maxWidth: '900px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      <button 
        onClick={() => navigate('/dashboard')}
        style={{ 
          background: 'none', 
          border: 'none', 
          cursor: 'pointer', 
          color: '#666', 
          marginBottom: '20px', 
          display: 'flex', 
          alignItems: 'center', 
          gap: '5px', 
          fontSize: '16px' 
        }}
      >
        ← Back to Dashboard
      </button>

      <div style={{ background: 'white', padding: '40px', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
        <h1 style={{ margin: '0 0 10px 0', color: '#1f2937' }}>Upload Verification Documents</h1>
        <p style={{ color: '#6b7280', marginBottom: '30px' }}>
          To activate your bank account, we need your Profile Photo, ID Document, and Signature.
          {userProfile && (
            <> • <span style={{ color: '#10b981' }}>✓ {Object.keys(userProfile).filter(k => k.includes('_url') && userProfile[k]).length} document(s) already uploaded</span></>
          )}
        </p>

        {error && (
          <div style={{ background: '#fee2e2', color: '#991b1b', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
            {error}
          </div>
        )}

        {success && (
          <div style={{ background: '#ecfdf5', color: '#065f46', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
            {success}
          </div>
        )}

        {/* ✅ NEW: Current Images Section */}
        {userProfile && (
          <div style={{ marginBottom: '40px', padding: '20px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
            <h3 style={{ margin: '0 0 20px 0', color: '#1e293b', fontSize: '18px' }}>Currently Uploaded</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr)', gap: '20px' }}>
              
              {userProfile.photo_url && (
                <div>
                  <strong>Profile Photo</strong>
                  <ImageDisplay 
                    src={userProfile.photo_url} 
                    alt="Profile Photo" 
                    size="small" 
                    shape="circle" 
                  />
                </div>
              )}
              
              {userProfile.id_photo_url && (
                <div>
                  <strong>ID Document</strong>
                  <ImageDisplay 
                    src={userProfile.id_photo_url} 
                    alt="ID Document" 
                    size="medium" 
                  />
                </div>
              )}
              
              {userProfile.signature_photo_url && (
                <div>
                  <strong>Signature</strong>
                  <ImageDisplay 
                    src={userProfile.signature_photo_url} 
                    alt="Signature" 
                    size="medium" 
                    shape="signature" 
                  />
                </div>
              )}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '30px' }}>
          
          {/* 1. Profile Photo */}
          <div style={{ border: '1px solid #e5e7eb', padding: '20px', borderRadius: '12px' }}>
            <label style={{ display: 'block', marginBottom: '10px', fontWeight: '600', color: '#374151' }}>
              1. Profile Photo (Selfie) {userProfile?.photo_url && '✓'}
            </label>
            <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
              <div style={{ flex: 1 }}>
                 <input 
                  type="file" 
                  name="photo" 
                  accept="image/*"
                  onChange={handleFileChange}
                  style={{ width: '100%' }}
                />
                <small style={{ color: '#6b7280', display: 'block', marginTop: '5px' }}>Clear face photo, JPG or PNG.</small>
              </div>
              <div>
                {previews.photo ? (
                  <img src={previews.photo} alt="Preview" style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #10b981' }} />
                ) : (
                  userProfile?.photo_url && (
                    <ImageDisplay src={userProfile.photo_url} alt="Current" size="small" shape="circle" />
                  )
                )}
              </div>
            </div>
          </div>

          {/* 2. ID Document */}
          <div style={{ border: '1px solid #e5e7eb', padding: '20px', borderRadius: '12px' }}>
            <label style={{ display: 'block', marginBottom: '10px', fontWeight: '600', color: '#374151' }}>
              2. ID Document / Passport {userProfile?.id_photo_url && '✓'}
            </label>
            <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
              <div style={{ flex: 1 }}>
                <input 
                  type="file" 
                  name="id_photo" 
                  accept="image/*"
                  onChange={handleFileChange}
                  style={{ width: '100%' }}
                />
                <small style={{ color: '#6b7280', display: 'block', marginTop: '5px' }}>Scan of National ID or Passport.</small>
              </div>
              <div>
                {previews.id_photo ? (
                  <img src={previews.id_photo} alt="Preview" style={{ width: '120px', height: '80px', objectFit: 'cover', borderRadius: '8px', border: '2px solid #10b981' }} />
                ) : (
                  userProfile?.id_photo_url && (
                    <ImageDisplay src={userProfile.id_photo_url} alt="Current" size="medium" />
                  )
                )}
              </div>
            </div>
          </div>

          {/* 3. Signature */}
          <div style={{ border: '1px solid #e5e7eb', padding: '20px', borderRadius: '12px' }}>
            <label style={{ display: 'block', marginBottom: '10px', fontWeight: '600', color: '#374151' }}>
              3. Signature {userProfile?.signature_photo_url && '✓'}
            </label>
            <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
              <div style={{ flex: 1 }}>
                <input 
                  type="file" 
                  name="signature_photo" 
                  accept="image/*"
                  onChange={handleFileChange}
                  style={{ width: '100%' }}
                />
                <small style={{ color: '#6b7280', display: 'block', marginTop: '5px' }}>Photo of your signature on white paper.</small>
              </div>
              <div>
                {previews.signature_photo ? (
                  <img src={previews.signature_photo} alt="Preview" style={{ width: '120px', height: '60px', objectFit: 'contain', borderRadius: '8px', border: '2px solid #10b981' }} />
                ) : (
                  userProfile?.signature_photo_url && (
                    <ImageDisplay src={userProfile.signature_photo_url} alt="Current" size="medium" shape="signature" />
                  )
                )}
              </div>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            style={{ 
              padding: '14px', 
              background: loading ? '#9ca3af' : '#2563eb', 
              color: 'white', 
              border: 'none', 
              borderRadius: '8px', 
              fontSize: '16px', 
              fontWeight: '600', 
              cursor: loading ? 'not-allowed' : 'pointer',
              marginTop: '10px'
            }}
          >
            {loading ? 'Uploading...' : 'Upload & Verify'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ProfilePhotos;