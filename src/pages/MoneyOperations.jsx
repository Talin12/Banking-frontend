import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const MoneyOperations = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('deposit');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [accountNumber, setAccountNumber] = useState('');

  // --- STATE MANAGEMENT ---
  
  // Deposit
  const [depositAmount, setDepositAmount] = useState('');

  // Withdraw
  const [withdrawStep, setWithdrawStep] = useState(1); // 1: Initiate, 2: Username
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawUsername, setWithdrawUsername] = useState('');

  // Transfer
  const [transferStep, setTransferStep] = useState(1); // 1: Initiate, 2: Question, 3: OTP
  const [recipientAccount, setRecipientAccount] = useState('');
  const [transferAmount, setTransferAmount] = useState('');
  const [transferDesc, setTransferDesc] = useState('');
  const [securityAnswer, setSecurityAnswer] = useState('');
  const [otp, setOtp] = useState('');

  useEffect(() => {
    // Fetch user's account number for default fields
    const fetchAccount = async () => {
      try {
        const res = await api.get('/profiles/my-profile/');
        const profile = res.data.profile?.data || res.data.profile || res.data;
        if (profile?.account_number) setAccountNumber(profile.account_number);
      } catch (err) {
        console.error("Could not load account details");
      }
    };
    fetchAccount();
  }, []);

  const clearMessage = () => setMessage({ text: '', type: '' });

  // --- HANDLERS ---

  const handleDeposit = async (e) => {
    e.preventDefault();
    setLoading(true);
    clearMessage();
    try {
      // Backend requires account_number in the body
      await api.post('/accounts/deposit/', { 
        account_number: accountNumber, 
        amount: depositAmount 
      });
      setMessage({ text: 'Deposit Successful!', type: 'success' });
      setDepositAmount('');
    } catch (err) {
      // Custom Error handling for Teller Permission
      if (err.response?.status === 403) {
        setMessage({ 
          text: 'Permission Denied: You need to be a Bank Teller to perform deposits.', 
          type: 'error' 
        });
      } else {
        setMessage({ 
          text: err.response?.data?.error || 'Deposit failed.', 
          type: 'error' 
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleWithdrawInitiate = async (e) => {
    e.preventDefault();
    setLoading(true);
    clearMessage();
    try {
      await api.post('/accounts/initiate-withdrawal/', {
        account_number: accountNumber,
        amount: withdrawAmount
      });
      setWithdrawStep(2); // Move to Username verification
      setMessage({ text: 'Please verify your username to confirm.', type: 'info' });
    } catch (err) {
      setMessage({ text: err.response?.data?.error || 'Withdrawal initiation failed.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleWithdrawConfirm = async (e) => {
    e.preventDefault();
    setLoading(true);
    clearMessage();
    try {
      await api.post('/accounts/verify-username-and-withdraw/', {
        username: withdrawUsername
      });
      setMessage({ text: 'Withdrawal Successful!', type: 'success' });
      setWithdrawStep(1);
      setWithdrawAmount('');
      setWithdrawUsername('');
    } catch (err) {
      setMessage({ text: err.response?.data?.error || 'Verification failed.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleTransferInitiate = async (e) => {
    e.preventDefault();
    setLoading(true);
    clearMessage();
    try {
      // Note: Backend expects sender_account and receiver_account
      await api.post('/accounts/transfer/initiate/', {
        sender_account: accountNumber,
        receiver_account: recipientAccount,
        amount: transferAmount,
        description: transferDesc
      });
      setTransferStep(2); // Move to Security Question
      setMessage({ text: 'Please answer your security question.', type: 'info' });
    } catch (err) {
      setMessage({ text: err.response?.data?.error || 'Transfer initiation failed.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleTransferSecurity = async (e) => {
    e.preventDefault();
    setLoading(true);
    clearMessage();
    try {
      await api.post('/accounts/transfer/verify-security-question/', {
        security_answer: securityAnswer
      });
      setTransferStep(3); // Move to OTP
      setMessage({ text: 'Security Verified. OTP sent to email.', type: 'info' });
    } catch (err) {
      setMessage({ text: err.response?.data?.error || 'Incorrect security answer.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleTransferOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    clearMessage();
    try {
      // WARNING: Ensure '/accounts/transfer/verify-otp/' is mapped in your backend urls.py!
      await api.post('/accounts/transfer/verify-otp/', {
        otp: otp
      });
      setMessage({ text: 'Transfer Complete!', type: 'success' });
      setTransferStep(1);
      setRecipientAccount('');
      setTransferAmount('');
      setTransferDesc('');
      setSecurityAnswer('');
      setOtp('');
    } catch (err) {
      if (err.response?.status === 404) {
        setMessage({ text: 'Error: Transfer OTP endpoint not found on server.', type: 'error' });
      } else {
        setMessage({ text: err.response?.data?.error || 'Invalid OTP.', type: 'error' });
      }
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
              onClick={() => { setActiveTab('deposit'); clearMessage(); }}
            >
              Deposit
            </button>
            <button 
              style={{ ...tabStyle, borderBottom: activeTab === 'withdraw' ? '3px solid #ef4444' : 'none', color: activeTab === 'withdraw' ? '#ef4444' : '#666' }}
              onClick={() => { setActiveTab('withdraw'); clearMessage(); setWithdrawStep(1); }}
            >
              Withdraw
            </button>
            <button 
              style={{ ...tabStyle, borderBottom: activeTab === 'transfer' ? '3px solid #3b82f6' : 'none', color: activeTab === 'transfer' ? '#3b82f6' : '#666' }}
              onClick={() => { setActiveTab('transfer'); clearMessage(); setTransferStep(1); }}
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
                background: message.type === 'success' ? '#dcfce7' : (message.type === 'info' ? '#e0f2fe' : '#fee2e2'),
                color: message.type === 'success' ? '#166534' : (message.type === 'info' ? '#0369a1' : '#991b1b')
              }}>
                {message.text}
              </div>
            )}

            {/* --- DEPOSIT FORM --- */}
            {activeTab === 'deposit' && (
              <form onSubmit={handleDeposit}>
                <h2 style={{ marginTop: 0 }}>Deposit Funds</h2>
                <div style={inputGroupStyle}>
                  <label style={labelStyle}>Your Account Number</label>
                  <input type="text" value={accountNumber} readOnly style={{ ...inputStyle, background: '#f9fafb' }} />
                </div>
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

            {/* --- WITHDRAW FORM --- */}
            {activeTab === 'withdraw' && (
              <>
                {withdrawStep === 1 ? (
                  <form onSubmit={handleWithdrawInitiate}>
                    <h2 style={{ marginTop: 0 }}>Withdraw - Step 1/2</h2>
                    <div style={inputGroupStyle}>
                      <label style={labelStyle}>From Account</label>
                      <input type="text" value={accountNumber} readOnly style={{ ...inputStyle, background: '#f9fafb' }} />
                    </div>
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
                    <button type="submit" disabled={loading} style={{ ...buttonStyle, background: '#ef4444' }}>
                      Next: Verify Identity
                    </button>
                  </form>
                ) : (
                  <form onSubmit={handleWithdrawConfirm}>
                    <h2 style={{ marginTop: 0 }}>Withdraw - Step 2/2</h2>
                    <p style={{ color: '#666', fontSize: '14px' }}>Please confirm your username to complete the withdrawal.</p>
                    <div style={inputGroupStyle}>
                      <label style={labelStyle}>Confirm Username</label>
                      <input 
                        type="text" 
                        required 
                        value={withdrawUsername}
                        onChange={e => setWithdrawUsername(e.target.value)}
                        style={inputStyle} 
                        placeholder="Enter your username" 
                      />
                    </div>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button type="button" onClick={() => setWithdrawStep(1)} style={{ ...buttonStyle, background: '#9ca3af' }}>Back</button>
                      <button type="submit" disabled={loading} style={{ ...buttonStyle, background: '#ef4444' }}>
                        {loading ? 'Processing...' : 'Confirm Withdraw'}
                      </button>
                    </div>
                  </form>
                )}
              </>
            )}

            {/* --- TRANSFER FORM --- */}
            {activeTab === 'transfer' && (
              <>
                {transferStep === 1 && (
                  <form onSubmit={handleTransferInitiate}>
                    <h2 style={{ marginTop: 0 }}>Transfer - Step 1/3</h2>
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
                      <label style={labelStyle}>Description</label>
                      <input 
                        type="text" 
                        value={transferDesc}
                        onChange={e => setTransferDesc(e.target.value)}
                        style={inputStyle} 
                        placeholder="e.g. Rent" 
                      />
                    </div>
                    <button type="submit" disabled={loading} style={{ ...buttonStyle, background: '#3b82f6' }}>
                      Next
                    </button>
                  </form>
                )}

                {transferStep === 2 && (
                  <form onSubmit={handleTransferSecurity}>
                    <h2 style={{ marginTop: 0 }}>Transfer - Step 2/3</h2>
                    <p style={{ color: '#666' }}>Please answer your security question to proceed.</p>
                    <div style={inputGroupStyle}>
                      <label style={labelStyle}>Security Answer</label>
                      <input 
                        type="password" 
                        required 
                        value={securityAnswer}
                        onChange={e => setSecurityAnswer(e.target.value)}
                        style={inputStyle} 
                        placeholder="Enter answer" 
                      />
                    </div>
                    <button type="submit" disabled={loading} style={{ ...buttonStyle, background: '#3b82f6' }}>
                      Next: Verify OTP
                    </button>
                  </form>
                )}

                {transferStep === 3 && (
                  <form onSubmit={handleTransferOTP}>
                    <h2 style={{ marginTop: 0 }}>Transfer - Step 3/3</h2>
                    <p style={{ color: '#666' }}>We sent an OTP to your email. Enter it below.</p>
                    <div style={inputGroupStyle}>
                      <label style={labelStyle}>Enter OTP</label>
                      <input 
                        type="text" 
                        required 
                        maxLength="6"
                        value={otp}
                        onChange={e => setOtp(e.target.value)}
                        style={{ ...inputStyle, letterSpacing: '4px', textAlign: 'center' }} 
                        placeholder="000000" 
                      />
                    </div>
                    <button type="submit" disabled={loading} style={{ ...buttonStyle, background: '#10b981' }}>
                      {loading ? 'Finalizing...' : 'Complete Transfer'}
                    </button>
                  </form>
                )}
              </>
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