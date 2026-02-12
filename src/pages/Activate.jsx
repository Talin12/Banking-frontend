import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const Activate = () => {
  const { uid, token } = useParams();
  const navigate = useNavigate();
  const [message, setMessage] = useState('Activating account...');

  useEffect(() => {
    fetch('https://bank-server-4xw9.onrender.com/api/v1/auth/users/activation/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ uid, token })
    })
    .then(res => {
      if (res.status === 204 || res.ok) {  // Djoser returns 204 on success
        setMessage('✅ Account activated! Redirecting...');
        setTimeout(() => navigate('/login'), 2000);
      } else {
        setMessage('❌ Activation failed');
      }
    })
    .catch(() => setMessage('❌ Error activating account'));
  }, [uid, token, navigate]);

  return <div style={{textAlign: 'center', marginTop: '100px'}}><h2>{message}</h2></div>;
};

export default Activate;