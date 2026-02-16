import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

// Helper to parse errors consistently
const getErrorMessage = (err) => {
  if (err.response && err.response.data) {
    const data = err.response.data;
    // 1. Custom backend error (e.g. lockout)
    if (data.error) return data.error;
    // 2. Generic DRF/Djoser errors
    if (data.detail) return data.detail;
    if (data.non_field_errors) return data.non_field_errors[0];
    
    // 3. specific field errors (e.g. "email": ["Enter a valid email."])
    const firstKey = Object.keys(data)[0];
    if (firstKey) {
      const msg = Array.isArray(data[firstKey]) ? data[firstKey][0] : data[firstKey];
      // Beautify the key (e.g. "security_answer" -> "Security Answer")
      const formattedKey = firstKey.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
      return `${formattedKey}: ${msg}`;
    }
  }
  return 'Login failed. Please check your connection.';
};

const Login = () => {
  const [step, setStep] = useState(1); // 1 = email/password, 2 = OTP
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { checkAuth } = useAuth();

  const handleCredentials = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await api.post('/auth/login/', { email, password });
      setStep(2); // Move to OTP step
      setError(''); // Clear any errors
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleOTP = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await api.post('/auth/verify-otp/', { otp });
      await checkAuth(); // Update user state
      navigate('/dashboard');
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '100px auto', padding: '20px' }}>
      <h1>NextGen Bank Login</h1>
      
      {error && (
        <div style={{ background: '#fee', color: '#c00', padding: '10px', marginBottom: '15px', borderRadius: '4px' }}>
          {error}
        </div>
      )}

      {step === 1 ? (
        <form onSubmit={handleCredentials}>
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{ width: '100%', padding: '8px' }}
            />
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{ width: '100%', padding: '8px' }}
            />
          </div>

          <button type="submit" disabled={loading} style={{ width: '100%', padding: '10px', background: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: loading ? 'not-allowed' : 'pointer' }}>
            {loading ? 'Sending OTP...' : 'Continue'}
          </button>
        </form>
      ) : (
        <form onSubmit={handleOTP}>
          <p style={{ marginBottom: '15px', color: '#28a745' }}>
            ✅ OTP sent to {email}. Check your email (and spam folder).
          </p>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>Enter OTP</label>
            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              required
              maxLength={6}
              style={{ width: '100%', padding: '8px', fontSize: '18px', letterSpacing: '4px' }}
              placeholder="000000"
            />
          </div>

          <button type="submit" disabled={loading} style={{ width: '100%', padding: '10px', background: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: loading ? 'not-allowed' : 'pointer' }}>
            {loading ? 'Verifying...' : 'Verify & Login'}
          </button>

          <button
            type="button"
            onClick={() => setStep(1)}
            style={{ width: '100%', padding: '10px', marginTop: '10px', background: '#6c757d', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
          >
            Back
          </button>
        </form>
      )}

      <p style={{ textAlign: 'center', marginTop: '15px' }}>
        Don't have an account? <Link to="/register">Register here</Link>
      </p>
    </div>
  );
};

export default Login;