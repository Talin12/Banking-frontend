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

  // Preview state (optional, for UX)
  const [previews, setPreviews] = useState({
    photo: null,
    id_photo: null,
    signature_photo: null
  });

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

    // Backend requires 'multipart/form-data' for files
    const formData = new FormData();
    
    // Only append files that have been selected
    if (files.photo) formData.append('photo', files.photo);
    if (files.id_photo) formData.append('id_photo', files.id_photo);
    if (files.signature_photo) formData.append('signature_photo', files.signature_photo);

    // If no files selected, show error
    if (!files.photo && !files.id_photo && !files.signature_photo) {
      setError("Please select at least one document to upload.");
      setLoading(false);
      return;
    }

    try {
      // The content-type header is set automatically by axios when passing FormData
      await api.patch('/profiles/my-profile/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      setSuccess('Documents uploaded successfully! Redirecting...');
      setTimeout(() => navigate('/dashboard'), 2000);
      
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.detail || 'Failed to upload documents. Please ensure files are valid images.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '40px 20px', maxWidth: '800px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      <button 
        onClick={() => navigate('/dashboard')}
        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#666', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '5px', fontSize: '16px' }}
      >
        ← Back to Dashboard
      </button>

      <div style={{ background: 'white', padding: '40px', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
        <h1 style={{ margin: '0 0 10px 0', color: '#1f2937' }}>Upload Verification Documents</h1>
        <p style={{ color: '#6b7280', marginBottom: '30px' }}>
          To activate your bank account, we need your Profile Photo, ID Document, and Signature.
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

        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '30px' }}>
          
          {/* 1. Profile Photo */}
          <div style={{ border: '1px solid #e5e7eb', padding: '20px', borderRadius: '12px' }}>
            <label style={{ display: 'block', marginBottom: '10px', fontWeight: '600', color: '#374151' }}>
              1. Profile Photo (Selfie)
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
              {previews.photo && (
                <img src={previews.photo} alt="Preview" style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #e5e7eb' }} />
              )}
            </div>
          </div>

          {/* 2. ID Document */}
          <div style={{ border: '1px solid #e5e7eb', padding: '20px', borderRadius: '12px' }}>
            <label style={{ display: 'block', marginBottom: '10px', fontWeight: '600', color: '#374151' }}>
              2. ID Document / Passport
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
              {previews.id_photo && (
                <img src={previews.id_photo} alt="Preview" style={{ width: '120px', height: '80px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #e5e7eb' }} />
              )}
            </div>
          </div>

          {/* 3. Signature */}
          <div style={{ border: '1px solid #e5e7eb', padding: '20px', borderRadius: '12px' }}>
            <label style={{ display: 'block', marginBottom: '10px', fontWeight: '600', color: '#374151' }}>
              3. Signature
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
              {previews.signature_photo && (
                <img src={previews.signature_photo} alt="Preview" style={{ width: '120px', height: '60px', objectFit: 'contain', borderRadius: '8px', border: '1px dashed #d1d5db' }} />
              )}
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