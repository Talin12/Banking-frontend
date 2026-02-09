import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const VirtualCards = () => {
  const navigate = useNavigate();
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // State for Create Card
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [accountNumber, setAccountNumber] = useState('');
  const [createLoading, setCreateLoading] = useState(false);

  // State for Top Up
  const [showTopUpModal, setShowTopUpModal] = useState(false);
  const [selectedCard, setSelectedCard] = useState(null);
  const [topUpAmount, setTopUpAmount] = useState('');
  const [topUpLoading, setTopUpLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // 1. Fetch Virtual Cards
      const cardRes = await api.get('/cards/virtual-cards/');
      
      console.log("Full API Response:", cardRes.data); // Debugging

      // --- FIX: Correctly extract data from the backend wrapper ---
      // Backend returns: { visa_card: { count: 1, results: [...] } }
      const visaCardData = cardRes.data.visa_card;
      
      let finalCards = [];

      if (visaCardData) {
        // Case A: Pagination is on (standard Django Rest Framework + your custom renderer)
        if (Array.isArray(visaCardData.results)) {
          finalCards = visaCardData.results;
        } 
        // Case B: Pagination is off (just an array inside visa_card)
        else if (Array.isArray(visaCardData)) {
          finalCards = visaCardData;
        }
      } 
      // Case C: Fallback (maybe structure changed or different renderer)
      else if (Array.isArray(cardRes.data)) {
        finalCards = cardRes.data;
      } else if (cardRes.data.results) {
        finalCards = cardRes.data.results;
      }

      setCards(finalCards);

      // 2. Fetch Profile to get Account Number (Auto-fill for creation)
      // Wrapped in separate try/catch so it doesn't break the page if profile fails
      try {
        const profileRes = await api.get('/profiles/my-profile/');
        // Handle potentially nested profile response
        const profile = profileRes.data.profile?.data || profileRes.data.profile || profileRes.data;
        
        if (profile && profile.account_number) {
          setAccountNumber(profile.account_number);
        }
      } catch (profileErr) {
        console.warn("Could not fetch profile for account number:", profileErr);
      }

    } catch (err) {
      console.error("Main Fetch Error:", err);
      // Ignore 404s (just means no cards created yet)
      if (err.response?.status !== 404) {
        if (err.response?.status === 401) {
          setError("Session expired. Please login again.");
        } else {
          setError('Failed to load cards. Please try again later.');
        }
      } else {
        setCards([]); // Ensure cards is empty array on 404
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCard = async (e) => {
    e.preventDefault();
    setCreateLoading(true);
    try {
      await api.post('/cards/virtual-cards/', {
        bank_account_number: accountNumber
      });
      setShowCreateModal(false);
      fetchData(); // Refresh list to show new card
      alert('Virtual card created successfully!');
    } catch (err) {
      const errorMsg = err.response?.data?.error || err.response?.data?.detail || 'Failed to create card.';
      alert(errorMsg);
    } finally {
      setCreateLoading(false);
    }
  };

  const handleTopUp = async (e) => {
    e.preventDefault();
    if (!selectedCard) return;
    setTopUpLoading(true);
    try {
      // FIX: Changed from post to put to match UpdateAPIView
      await api.put(`/cards/virtual-cards/${selectedCard.id}/top-up/`, {
        amount: topUpAmount
      });
      setShowTopUpModal(false);
      setTopUpAmount('');
      fetchData(); // Refresh balance
      alert('Card topped up successfully!');
    } catch (err) {
       const errorMsg = err.response?.data?.error || err.response?.data?.detail || 'Top-up failed.';
       alert(errorMsg);
    } finally {
      setTopUpLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this virtual card?')) return;
    try {
      await api.delete(`/cards/virtual-cards/${id}/`);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to delete card.');
    }
  };

  // --- UI HELPERS ---
  const formatCardNumber = (num) => {
    return num ? num.replace(/(\d{4})/g, '$1 ').trim() : '**** **** **** ****';
  };

  const formatExpiry = (dateString) => {
    if (!dateString) return 'MM/YY';
    const date = new Date(dateString);
    return `${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear().toString().slice(-2)}`;
  };

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <div>
          <button 
            onClick={() => navigate('/dashboard')}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#666', marginBottom: '10px' }}
          >
            ← Back to Dashboard
          </button>
          <h1 style={{ margin: 0, color: '#1f2937' }}>Virtual Cards</h1>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          disabled={cards.length >= 3}
          style={{
            padding: '12px 24px',
            background: cards.length >= 3 ? '#9ca3af' : '#2563eb',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: cards.length >= 3 ? 'not-allowed' : 'pointer',
            fontSize: '16px',
            fontWeight: '500'
          }}
        >
          {cards.length >= 3 ? 'Limit Reached (Max 3)' : '+ Create New Card'}
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>Loading cards...</div>
      ) : error ? (
        <div style={{ color: 'red', padding: '20px' }}>{error}</div>
      ) : cards.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px', background: 'white', borderRadius: '12px' }}>
          <h3>No Virtual Cards Yet</h3>
          <p>Create a virtual card to make secure online payments.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '30px' }}>
          {cards.map(card => (
            <div key={card.id} style={{
              background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
              borderRadius: '16px',
              padding: '25px',
              color: 'white',
              boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
              position: 'relative',
              overflow: 'hidden'
            }}>
              {/* Card Design Details */}
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '30px' }}>
                <span style={{ fontStyle: 'italic', fontWeight: 'bold', fontSize: '20px' }}>NextGen Bank</span>
                <span style={{ background: 'rgba(255,255,255,0.2)', padding: '4px 12px', borderRadius: '20px', fontSize: '12px' }}>
                  {card.status.toUpperCase()}
                </span>
              </div>

              <div style={{ fontSize: '22px', letterSpacing: '2px', marginBottom: '25px', fontFamily: 'monospace' }}>
                {formatCardNumber(card.card_number)}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                <div>
                  <div style={{ fontSize: '10px', opacity: 0.7, textTransform: 'uppercase' }}>Expires</div>
                  <div style={{ fontSize: '14px' }}>{formatExpiry(card.expiry_date)}</div>
                </div>
                <div>
                  <div style={{ fontSize: '10px', opacity: 0.7, textTransform: 'uppercase' }}>CVV</div>
                  <div style={{ fontSize: '14px' }}>{card.cvv}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '10px', opacity: 0.7, textTransform: 'uppercase' }}>Balance</div>
                  <div style={{ fontSize: '18px', fontWeight: 'bold' }}>${card.balance}</div>
                </div>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: '10px', paddingTop: '15px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                <button 
                  onClick={() => { setSelectedCard(card); setShowTopUpModal(true); }}
                  style={{ flex: 1, padding: '8px', background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', borderRadius: '6px', cursor: 'pointer' }}
                >
                  Top Up
                </button>
                <button 
                  onClick={() => handleDelete(card.id)}
                  style={{ flex: 1, padding: '8px', background: 'rgba(239,68,68,0.3)', border: 'none', color: '#fca5a5', borderRadius: '6px', cursor: 'pointer' }}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CREATE MODAL */}
      {showCreateModal && (
        <div style={modalOverlayStyle}>
          <div style={modalContentStyle}>
            <h2>Create Virtual Card</h2>
            <p style={{ color: '#666', fontSize: '14px' }}>Linked to your main account</p>
            <form onSubmit={handleCreateCard}>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '5px' }}>Source Account Number</label>
                <input
                  type="text"
                  required
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  placeholder="Enter your account number"
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ddd' }}
                />
                <small style={{ color: '#666' }}>Found in Dashboard or Profile</small>
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button type="submit" disabled={createLoading} style={primaryButtonStyle}>
                  {createLoading ? 'Creating...' : 'Create Card'}
                </button>
                <button type="button" onClick={() => setShowCreateModal(false)} style={secondaryButtonStyle}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TOP UP MODAL */}
      {showTopUpModal && (
        <div style={modalOverlayStyle}>
          <div style={modalContentStyle}>
            <h2>Top Up Card</h2>
            <p style={{ color: '#666', fontSize: '14px' }}>
              Add funds from your main account to card ending in <strong>{selectedCard?.card_number.slice(-4)}</strong>
            </p>
            <form onSubmit={handleTopUp}>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '5px' }}>Amount ($)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={topUpAmount}
                  onChange={(e) => setTopUpAmount(e.target.value)}
                  placeholder="0.00"
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ddd' }}
                />
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button type="submit" disabled={topUpLoading} style={primaryButtonStyle}>
                  {topUpLoading ? 'Processing...' : 'Top Up Now'}
                </button>
                <button type="button" onClick={() => setShowTopUpModal(false)} style={secondaryButtonStyle}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// Styles
const modalOverlayStyle = {
  position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
  background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
};

const modalContentStyle = {
  background: 'white', padding: '30px', borderRadius: '12px', width: '90%', maxWidth: '400px'
};

const primaryButtonStyle = {
  flex: 1, padding: '10px', background: '#2563eb', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '500'
};

const secondaryButtonStyle = {
  flex: 1, padding: '10px', background: '#e5e7eb', color: '#374151', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '500'
};

export default VirtualCards;