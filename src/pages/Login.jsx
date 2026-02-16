import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Lock, Zap } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { OtpInput } from '../components/ui/OtpInput';

function getErrorMessage(err) {
  if (err.response?.data) {
    const data = err.response.data;
    if (data.error) return data.error;
    if (data.detail) return data.detail;
    if (data.non_field_errors) return data.non_field_errors[0];
    const firstKey = Object.keys(data)[0];
    if (firstKey) {
      const msg = Array.isArray(data[firstKey]) ? data[firstKey][0] : data[firstKey];
      const formattedKey = firstKey.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
      return `${formattedKey}: ${msg}`;
    }
  }
  return 'Login failed. Please check your connection.';
}

const trustBadges = [
  { icon: Shield, text: 'Bank-grade security' },
  { icon: Lock, text: '256-bit encryption' },
  { icon: Zap, text: 'Instant verification' },
];

export default function Login() {
  const [step, setStep] = useState(1);
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
      setStep(2);
      setError('');
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleOTP = async (e) => {
    e.preventDefault();
    if (otp.length !== 6) return;
    setError('');
    setLoading(true);
    try {
      await api.post('/auth/verify-otp/', { otp });
      await checkAuth();
      navigate('/dashboard');
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-elite-black relative overflow-hidden">
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-elite-bg via-elite-surface to-elite-black" />
      <div className="absolute inset-0 bg-gradient-radial opacity-60" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-gold/5 rounded-full blur-[120px] animate-gradient" />

      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <div className="glass-card rounded-3xl p-8 lg:p-10 shadow-2xl">
            <div className="text-center mb-8">
              <h1 className="text-2xl lg:text-3xl font-display font-heading text-white mb-1">
                NextGen <span className="text-gold">Bank</span>
              </h1>
              <p className="text-elite-text-muted text-sm">Sign in to your account</p>
            </div>

            <AnimatePresence mode="wait">
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-6 p-4 rounded-xl bg-danger/10 border border-danger/30 text-danger text-sm"
                >
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence mode="wait">
              {step === 1 ? (
                <motion.form
                  key="credentials"
                  onSubmit={handleCredentials}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-5"
                >
                  <Input
                    label="Email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                  <Input
                    label="Password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <Button type="submit" variant="primary" size="lg" className="w-full" loading={loading}>
                    {loading ? 'Sending OTP...' : 'Continue'}
                  </Button>
                </motion.form>
              ) : (
                <motion.form
                  key="otp"
                  onSubmit={handleOTP}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  <p className="text-emerald/90 text-sm text-center">
                    OTP sent to <strong className="text-white">{email}</strong>. Check your email and spam folder.
                  </p>
                  <div>
                    <label className="block text-sm font-medium text-elite-text-muted mb-3 text-center">
                      Enter 6-digit code
                    </label>
                    <OtpInput value={otp} onChange={setOtp} length={6} disabled={loading} />
                  </div>
                  <Button
                    type="submit"
                    variant="success"
                    size="lg"
                    className="w-full"
                    loading={loading}
                    disabled={otp.length !== 6}
                  >
                    {loading ? 'Verifying...' : 'Verify & sign in'}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="md"
                    className="w-full"
                    onClick={() => setStep(1)}
                  >
                    Back
                  </Button>
                </motion.form>
              )}
            </AnimatePresence>

            <p className="text-center text-sm text-elite-text-muted mt-6">
              Don&apos;t have an account?{' '}
              <Link to="/register" className="text-gold hover:text-gold-light transition-colors">
                Register
              </Link>
            </p>
          </div>

          {/* Trust badges */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-8 flex flex-wrap justify-center gap-6"
          >
            {trustBadges.map(({ icon: Icon, text }, i) => (
              <div
                key={text}
                className="flex items-center gap-2 text-elite-text-muted text-sm"
              >
                <span className="text-gold/80">
                  <Icon size={18} />
                </span>
                <span>{text}</span>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
