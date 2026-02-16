import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

const Register = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    re_password: '',
    first_name: '',
    last_name: '',
    id_no: '',
    security_question: '',
    security_answer: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (formData.password !== formData.re_password) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      await register(formData);
      setSuccess('Registration successful! Please check your email to activate your account.');
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      // --- IMPROVED ERROR HANDLING START ---
      if (err.response && err.response.data) {
        const data = err.response.data;

        // 1. Check for specific common field errors first
        if (data.password) {
          setError(data.password[0]); // e.g., "This password is too short."
        } else if (data.email) {
          setError(data.email[0]); // e.g., "Enter a valid email address."
        } else if (data.id_no) {
          setError(`ID Number: ${data.id_no[0]}`);
        } else if (data.username) {
          setError(data.username[0]);
        } else if (data.non_field_errors) {
          setError(data.non_field_errors[0]); // General errors unrelated to a specific field
        } else if (data.detail) {
          setError(data.detail); // Authentication/Permission generic errors
        } else {
          // 2. Fallback: Find the first available error message from any field
          const firstErrorKey = Object.keys(data)[0];
          if (firstErrorKey) {
            const errorMsg = Array.isArray(data[firstErrorKey]) 
              ? data[firstErrorKey][0] 
              : data[firstErrorKey];
            
            // Format key to look nice (e.g., "first_name" -> "First name")
            const formattedKey = firstErrorKey.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase());
            setError(`${formattedKey}: ${errorMsg}`);
          } else {
            setError('Registration failed. Please try again.');
          }
        }
      } else {
        setError('Network error. Please try again later.');
      }
      // --- IMPROVED ERROR HANDLING END ---
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '50px auto', padding: '20px' }}>
      <h1>Create Account</h1>

      {error && (
        <div style={{ background: '#fee', color: '#c00', padding: '10px', marginBottom: '15px', borderRadius: '4px' }}>
          {error}
        </div>
      )}

      {success && (
        <div style={{ background: '#efe', color: '#0a0', padding: '10px', marginBottom: '15px', borderRadius: '4px' }}>
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>First Name</label>
          <input
            type="text"
            name="first_name"
            value={formData.first_name}
            onChange={handleChange}
            required
            style={{ width: '100%', padding: '8px', fontSize: '14px' }}
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>Last Name</label>
          <input
            type="text"
            name="last_name"
            value={formData.last_name}
            onChange={handleChange}
            required
            style={{ width: '100%', padding: '8px', fontSize: '14px' }}
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            style={{ width: '100%', padding: '8px', fontSize: '14px' }}
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>ID Number (numbers only)</label>
          <input
            type="number"
            name="id_no"
            value={formData.id_no}
            onChange={handleChange}
            required
            style={{ width: '100%', padding: '8px', fontSize: '14px' }}
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>Security Question</label>
          <select
            name="security_question"
            value={formData.security_question}
            onChange={handleChange}
            required
            style={{ width: '100%', padding: '8px', fontSize: '14px' }}
          >
            <option value="">Select a question...</option>
            <option value="maiden_name">What is your mother's maiden name?</option>
            <option value="favourite_color">What is your favourite color?</option>
            <option value="birth_city">What is the city where you were born?</option>
            <option value="childhood_friend">What is the name of your childhood bestfriend?</option>
          </select>
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>Security Answer</label>
          <input
            type="text"
            name="security_answer"
            value={formData.security_answer}
            onChange={handleChange}
            required
            style={{ width: '100%', padding: '8px', fontSize: '14px' }}
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>Password</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            style={{ width: '100%', padding: '8px', fontSize: '14px' }}
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>Confirm Password</label>
          <input
            type="password"
            name="re_password"
            value={formData.re_password}
            onChange={handleChange}
            required
            style={{ width: '100%', padding: '8px', fontSize: '14px' }}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            width: '100%',
            padding: '10px',
            background: '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontSize: '16px',
            marginBottom: '10px'
          }}
        >
          {loading ? 'Registering...' : 'Register'}
        </button>
      </form>

      <p style={{ textAlign: 'center', marginTop: '15px' }}>
        Already have an account? <Link to="/login">Login here</Link>
      </p>
    </div>
  );
};

export default Register;