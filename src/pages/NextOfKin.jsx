import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Added Import
import api from '../services/api';

const NextOfKin = () => {
  const navigate = useNavigate(); // Hook for navigation
  const [nextOfKinList, setNextOfKinList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  // State matches backend model fields exactly
  const [formData, setFormData] = useState({
    title: '',
    first_name: '',
    last_name: '',
    other_names: '',
    gender: '',
    date_of_birth: '',
    relationship: '',
    phone_number: '',
    email_address: '',
    address: '',
    city: '',
    country: '' 
  });

  useEffect(() => {
    fetchNextOfKin();
  }, []);

  const fetchNextOfKin = async () => {
    setLoading(true);
    try {
      const response = await api.get('/profiles/my-profile/next-of-kin/');
      // Unwrap logic: { status_code: 200, next_of_kin: [...] }
      let data = response.data;
      if (data && data.next_of_kin) {
        data = data.next_of_kin;
      }
      const list = data.results || (Array.isArray(data) ? data : []);
      setNextOfKinList(list);
      setError(null);
    } catch (err) {
      console.error('Fetch error:', err);
      setError('Failed to fetch next of kin list.');
      setNextOfKinList([]); 
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.put(`/profiles/my-profile/next-of-kin/${editingId}/`, formData);
      } else {
        await api.post('/profiles/my-profile/next-of-kin/', formData);
      }
      
      setShowForm(false);
      setEditingId(null);
      resetForm();
      fetchNextOfKin();
      setError(null);
    } catch (err) {
      console.error("Submission Error:", err);
      
      // ERROR HANDLING: Extract specific backend validation messages
      let errorMessage = 'Failed to save next of kin.';
      if (err.response && err.response.data) {
        const data = err.response.data;
        console.log("SERVER VALIDATION ERRORS:", data);

        let validationErrors = null;
        if (data.next_of_kin && typeof data.next_of_kin === 'object') {
          validationErrors = data.next_of_kin;
        } else if (data.errors) {
          validationErrors = data.errors;
        } else {
           validationErrors = data;
        }

        if (validationErrors && typeof validationErrors === 'object') {
          const messages = Object.entries(validationErrors)
            .map(([field, msgs]) => {
              if (field === 'status_code' || field === 'object_label') return null;
              const msgText = Array.isArray(msgs) ? msgs.join(' ') : String(msgs);
              const fieldName = field.replace(/_/g, ' ').toUpperCase();
              return `${fieldName}: ${msgText}`;
            })
            .filter(Boolean)
            .join(' | ');
          
          if (messages) errorMessage = messages;
        }
      }
      setError(errorMessage);
    }
  };

  const handleEdit = (kin) => {
    setFormData({
      title: kin.title || '',
      first_name: kin.first_name,
      last_name: kin.last_name,
      other_names: kin.other_names || '',
      gender: kin.gender || '',
      date_of_birth: kin.date_of_birth || '',
      relationship: kin.relationship,
      phone_number: kin.phone_number,
      email_address: kin.email_address || '',
      address: kin.address || '',
      city: kin.city || '',
      country: kin.country || ''
    });
    setEditingId(kin.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this next of kin?')) return;
    try {
      await api.delete(`/profiles/my-profile/next-of-kin/${id}/`);
      fetchNextOfKin();
      setError(null);
    } catch (err) {
      console.error(err);
      setError('Failed to delete next of kin');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      first_name: '',
      last_name: '',
      other_names: '',
      gender: '',
      date_of_birth: '',
      relationship: '',
      phone_number: '',
      email_address: '',
      address: '',
      city: '',
      country: ''
    });
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
    resetForm();
    setError(null);
  };

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      
      {/* Back Button */}
      <button
        onClick={() => navigate('/dashboard')}
        style={{
          marginBottom: '20px',
          background: 'transparent',
          border: '1px solid #d1d5db',
          padding: '8px 16px',
          borderRadius: '6px',
          cursor: 'pointer',
          color: '#4b5563',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontWeight: '500',
          transition: 'all 0.2s'
        }}
        onMouseOver={(e) => e.target.style.background = '#f3f4f6'}
        onMouseOut={(e) => e.target.style.background = 'transparent'}
      >
        <span>←</span> Back to Dashboard
      </button>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h1 style={{ margin: 0, color: '#1f2937' }}>Next of Kin / Emergency Contacts</h1>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            style={{
              padding: '10px 20px', background: '#10b981', color: 'white',
              border: 'none', borderRadius: '8px', cursor: 'pointer',
              fontSize: '16px', fontWeight: '500', transition: 'background 0.2s'
            }}
          >
            + Add Next of Kin
          </button>
        )}
      </div>

      {error && (
        <div style={{ 
          background: '#fee2e2', 
          border: '1px solid #f87171',
          color: '#991b1b', 
          padding: '15px', 
          borderRadius: '8px', 
          marginBottom: '20px',
          whiteSpace: 'pre-wrap',
          fontFamily: 'monospace',
          fontSize: '14px'
        }}>
          <strong>Error:</strong> {error}
        </div>
      )}

      {showForm && (
        <form onSubmit={handleSubmit} style={{
          background: 'white', padding: '30px', borderRadius: '8px',
          border: '1px solid #e5e7eb', marginBottom: '30px',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
        }}>
          <h3 style={{ marginTop: 0, marginBottom: '20px', color: '#374151' }}>
            {editingId ? 'Edit' : 'Add'} Next of Kin
          </h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '20px' }}>
            
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500', color: '#4b5563' }}>Title *</label>
              <select
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                required
                style={{ width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '6px', background: 'white' }}
              >
                <option value="">Select Title</option>
                <option value="mr">Mr.</option>
                <option value="mrs">Mrs.</option>
                <option value="miss">Miss</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500', color: '#4b5563' }}>Gender *</label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleInputChange}
                required
                style={{ width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '6px', background: 'white' }}
              >
                <option value="">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500', color: '#4b5563' }}>First Name *</label>
              <input
                type="text" name="first_name" value={formData.first_name}
                onChange={handleInputChange} required
                style={{ width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '6px' }}
              />
            </div>
            
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500', color: '#4b5563' }}>Last Name *</label>
              <input
                type="text" name="last_name" value={formData.last_name}
                onChange={handleInputChange} required
                style={{ width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '6px' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500', color: '#4b5563' }}>Date of Birth *</label>
              <input
                type="date" name="date_of_birth" value={formData.date_of_birth}
                onChange={handleInputChange} required
                style={{ width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '6px' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500', color: '#4b5563' }}>Relationship *</label>
              <input
                type="text" name="relationship" value={formData.relationship}
                onChange={handleInputChange} required
                placeholder="e.g., Spouse, Parent"
                style={{ width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '6px' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500', color: '#4b5563' }}>Phone Number *</label>
              <input
                type="tel" name="phone_number" value={formData.phone_number}
                onChange={handleInputChange} required
                placeholder="+1234567890"
                style={{ width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '6px' }}
              />
              <small style={{ color: '#6b7280', fontSize: '12px' }}>Include country code (e.g. +254)</small>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500', color: '#4b5563' }}>Country *</label>
              <input
                type="text" name="country" value={formData.country}
                onChange={handleInputChange} required
                placeholder="e.g. United States, Kenya, India"
                style={{ width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '6px' }}
              />
              <small style={{ color: '#6b7280', fontSize: '12px' }}>Enter full country name (not code)</small>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500', color: '#4b5563' }}>Email Address *</label>
              <input
                type="email" name="email_address" value={formData.email_address}
                onChange={handleInputChange} required
                style={{ width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '6px' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500', color: '#4b5563' }}>City *</label>
              <input
                type="text" name="city" value={formData.city}
                onChange={handleInputChange} required
                style={{ width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '6px' }}
              />
            </div>

            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500', color: '#4b5563' }}>Address *</label>
              <input
                type="text" name="address" value={formData.address}
                onChange={handleInputChange} required
                style={{ width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '6px' }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button type="submit" style={{ padding: '10px 24px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '500' }}>
              {editingId ? 'Update' : 'Save'}
            </button>
            <button type="button" onClick={handleCancel} style={{ padding: '10px 24px', background: '#6b7280', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '500' }}>
              Cancel
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>Loading contacts...</div>
      ) : nextOfKinList.length === 0 ? (
        <div style={{ background: 'white', padding: '40px', textAlign: 'center', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
          <p style={{ fontSize: '18px', color: '#4b5563' }}>No emergency contacts added yet.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '20px' }}>
          {nextOfKinList.map((kin) => (
            <div key={kin.id} style={{
              background: 'white', padding: '24px', borderRadius: '8px', border: '1px solid #e5e7eb',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
            }}>
              <h3 style={{ margin: '0 0 16px 0', color: '#111827', fontSize: '18px' }}>
                {kin.first_name} {kin.last_name}
              </h3>
              <div style={{ marginBottom: '12px' }}>
                <span style={{ fontSize: '12px', color: '#6b7280', display: 'block', textTransform: 'uppercase' }}>Relationship</span>
                <span style={{ fontSize: '16px', color: '#374151' }}>{kin.relationship}</span>
              </div>
              <div style={{ marginBottom: '12px' }}>
                <span style={{ fontSize: '12px', color: '#6b7280', display: 'block', textTransform: 'uppercase' }}>Phone</span>
                <span style={{ fontSize: '16px', color: '#374151' }}>{kin.phone_number}</span>
              </div>
              <div style={{ marginBottom: '12px' }}>
                <span style={{ fontSize: '12px', color: '#6b7280', display: 'block', textTransform: 'uppercase' }}>Country</span>
                <span style={{ fontSize: '16px', color: '#374151' }}>{kin.country}</span>
              </div>
              
              <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                <button onClick={() => handleEdit(kin)} style={{ flex: 1, padding: '8px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', transition: 'background 0.2s' }}>
                  Edit
                </button>
                <button onClick={() => handleDelete(kin.id)} style={{ flex: 1, padding: '8px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', transition: 'background 0.2s' }}>
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default NextOfKin;