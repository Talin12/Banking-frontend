import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle } from 'lucide-react';
import api from '../services/api';

export default function Activate() {
  const { uid, token } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('loading'); // 'loading' | 'success' | 'error'
  const [message, setMessage] = useState('Activating your account...');

  useEffect(() => {
    const baseURL = api.defaults.baseURL || '';
    const url = `${baseURL.replace(/\/$/, '')}/auth/users/activation/`;
    fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ uid, token }),
    })
      .then((res) => {
        if (res.status === 204 || res.ok) {
          setStatus('success');
          setMessage('Account activated. Redirecting to login...');
          setTimeout(() => navigate('/login'), 2000);
        } else {
          setStatus('error');
          setMessage('Activation failed. The link may be invalid or expired.');
        }
      })
      .catch(() => {
        setStatus('error');
        setMessage('Something went wrong. Please try again.');
      });
  }, [uid, token, navigate]);

  return (
    <div className="min-h-screen bg-elite-black flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card rounded-3xl p-10 max-w-md w-full text-center"
      >
        {status === 'loading' && (
          <div className="flex flex-col items-center gap-6">
            <div className="w-16 h-16 border-2 border-gold border-t-transparent rounded-full animate-spin" />
            <p className="text-white font-medium">{message}</p>
          </div>
        )}
        {status === 'success' && (
          <div className="flex flex-col items-center gap-6">
            <div className="w-20 h-20 rounded-full bg-emerald/20 flex items-center justify-center">
              <CheckCircle className="text-emerald" size={48} />
            </div>
            <p className="text-xl font-heading text-white">{message}</p>
          </div>
        )}
        {status === 'error' && (
          <div className="flex flex-col items-center gap-6">
            <div className="w-20 h-20 rounded-full bg-danger/20 flex items-center justify-center">
              <XCircle className="text-danger" size={48} />
            </div>
            <p className="text-lg text-elite-text-muted">{message}</p>
            <button
              onClick={() => navigate('/login')}
              className="px-6 py-3 rounded-xl bg-gold text-black font-heading hover:shadow-glow-gold transition-all"
            >
              Go to Login
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
}
