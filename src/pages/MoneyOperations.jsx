import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const MoneyOperations = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('deposit');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  // Deposit State
  const [depositAmount, setDepositAmount] = useState('');

  // Withdraw State
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawPin, setWithdrawPin] = useState(''); // Assuming PIN is needed

  // Transfer State
  const [recipientAccount, setRecipientAccount] = useState('');
  const [transferAmount, setTransferAmount] = useState('');
  const [transferDesc, setTransferDesc] = useState('');

  const clearMessage = () => setMessage({ text: '', type: '' });

  const handleDeposit = async (e) => {
    e.preventDefault();
    setLoading(true);
    clearMessage();
    try {
      await api.post('/accounts/deposit/', { amount: depositAmount });
      setMessage({ text: 'Deposit successful!', type: 'success' });
      setDepositAmount('');
    } catch (err) {
      setMessage({ 
        text: err.response?.data?.message || 'Deposit failed. Please try again.', 
        type: 'error' 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleWithdraw = async (e) => {
    e.preventDefault();
    setLoading(true);
    clearMessage();
    try {
      // Step 1: Initiate Withdrawal
      // Note: Adjust endpoint if your backend requires a 2-step process (initiate -> verify)
      await api.post('/accounts/initiate-withdrawal/', { 
        amount: withdrawAmount,
        pin: withdrawPin 
      });
      setMessage({ text: 'Withdrawal initiated successfully!', type: 'success' });
      setWithdrawAmount('');
      setWithdrawPin('');
    } catch (err) {
      setMessage({ 
        text: err.response?.data?.message || 'Withdrawal failed.', 
        type: 'error' 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleTransfer = async (e) => {
    e.preventDefault();
    setLoading(true);
    clearMessage();
    try {
      // Step 1: Verify Recipient & Initiate
      await api.post('/accounts/transfer/initiate/', {
        recipient_account_number: recipientAccount,
        amount: transferAmount,
        description: transferDesc
      });
      setMessage({ text: 'Transfer successful!', type: 'success' });
      setRecipientAccount('');
      setTransferAmount('');
      setTransferDesc('');
    } catch (err) {
      setMessage({ 
        text: err.response?.data?.message || 'Transfer failed. Check account number.', 
        type: 'error' 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f3f4f6', padding: '40px 20px' }}>
      <div style={{ maxWidth: '600px', margin: '0 auto' }}>
        
        {/* Header */}
        <button 
          onClick={() => navigate('/dashboard')}
          style={{ background: 'none', border: 'none', color: '#666', marginBottom: '20px', cursor: 'pointer' }}
        >
          ← Back to Dashboard
        </button>
        
        <div style={{ background: 'white', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
          
          {/* Tabs */}
          <div style={{ display: 'flex', borderBottom: '1px solid #eee' }}>
            <button 
              style={{ ...tabStyle, borderBottom: activeTab === 'deposit' ? '3px solid #10b981' : 'none', color: activeTab === 'deposit' ? '#10b981' : '#666' }}
              onClick={() => setActiveTab('deposit')}
            >
              Deposit
            </button>
            <button 
              style={{ ...tabStyle, borderBottom: activeTab === 'withdraw' ? '3px solid #ef4444' : 'none', color: activeTab === 'withdraw' ? '#ef4444' : '#666' }}
              onClick={() => setActiveTab('withdraw')}
            >
              Withdraw
            </button>
            <button 
              style={{ ...tabStyle, borderBottom: activeTab === 'transfer' ? '3px solid #3b82f6' : 'none', color: activeTab === 'transfer' ? '#3b82f6' : '#666' }}
              onClick={() => setActiveTab('transfer')}
            >
              Transfer
            </button>
          </div>

          <div style={{ padding: '30px' }}>
            {message.text && (
              <div style={{ 
                padding: '12px', 
                borderRadius: '8px', 
                marginBottom: '20px',
                background: message.type === 'success' ? '#dcfce7' : '#fee2e2',
                color: message.type === 'success' ? '#166534' : '#991b1b'
              }}>
                {message.text}
              </div>
            )}

            {/* DEPOSIT FORM */}
            {activeTab === 'deposit' && (
              <form onSubmit={handleDeposit}>
                <h2 style={{ marginTop: 0 }}>Add Money</h2>
                <div style={inputGroupStyle}>
                  <label style={labelStyle}>Amount ($)</label>
                  <input 
                    type="number" 
                    required 
                    min="1"
                    value={depositAmount}
                    onChange={e => setDepositAmount(e.target.value)}
                    style={inputStyle} 
                    placeholder="Enter amount" 
                  />
                </div>
                <button type="submit" disabled={loading} style={{ ...buttonStyle, background: '#10b981' }}>
                  {loading ? 'Processing...' : 'Deposit Funds'}
                </button>
              </form>
            )}

            {/* WITHDRAW FORM */}
            {activeTab === 'withdraw' && (
              <form onSubmit={handleWithdraw}>
                <h2 style={{ marginTop: 0 }}>Withdraw Funds</h2>
                <div style={inputGroupStyle}>
                  <label style={labelStyle}>Amount ($)</label>
                  <input 
                    type="number" 
                    required 
                    min="1"
                    value={withdrawAmount}
                    onChange={e => setWithdrawAmount(e.target.value)}
                    style={inputStyle} 
                    placeholder="Enter amount" 
                  />
                </div>
                <div style={inputGroupStyle}>
                  <label style={labelStyle}>Confirm PIN</label>
                  <input 
                    type="password" 
                    required 
                    value={withdrawPin}
                    onChange={e => setWithdrawPin(e.target.value)}
                    style={inputStyle} 
                    placeholder="****" 
                  />
                </div>
                <button type="submit" disabled={loading} style={{ ...buttonStyle, background: '#ef4444' }}>
                  {loading ? 'Processing...' : 'Withdraw Now'}
                </button>
              </form>
            )}

            {/* TRANSFER FORM */}
            {activeTab === 'transfer' && (
              <form onSubmit={handleTransfer}>
                <h2 style={{ marginTop: 0 }}>Send Money</h2>
                <div style={inputGroupStyle}>
                  <label style={labelStyle}>Recipient Account Number</label>
                  <input 
                    type="text" 
                    required 
                    value={recipientAccount}
                    onChange={e => setRecipientAccount(e.target.value)}
                    style={inputStyle} 
                    placeholder="Account Number" 
                  />
                </div>
                <div style={inputGroupStyle}>
                  <label style={labelStyle}>Amount ($)</label>
                  <input 
                    type="number" 
                    required 
                    min="1"
                    value={transferAmount}
                    onChange={e => setTransferAmount(e.target.value)}
                    style={inputStyle} 
                    placeholder="Enter amount" 
                  />
                </div>
                <div style={inputGroupStyle}>
                  <label style={labelStyle}>Description (Optional)</label>
                  <input 
                    type="text" 
                    value={transferDesc}
                    onChange={e => setTransferDesc(e.target.value)}
                    style={inputStyle} 
                    placeholder="e.g. Rent, Dinner" 
                  />
                </div>
                <button type="submit" disabled={loading} style={{ ...buttonStyle, background: '#3b82f6' }}>
                  {loading ? 'Processing...' : 'Send Transfer'}
                </button>
              </form>
            )}

          </div>
        </div>
      </div>
    </div>
  );
};

// Styles
const tabStyle = {
  flex: 1, padding: '15px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px', fontWeight: '600'
};
const inputGroupStyle = { marginBottom: '20px' };
const labelStyle = { display: 'block', marginBottom: '8px', color: '#4b5563', fontSize: '14px', fontWeight: '500' };
const inputStyle = { width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '16px' };
const buttonStyle = { width: '100%', padding: '12px', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '16px', fontWeight: '600' };

export default MoneyOperations;