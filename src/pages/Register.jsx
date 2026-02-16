import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, Lock, Zap } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';

const SECURITY_OPTIONS = [
  { value: '', label: 'Select a question...' },
  { value: 'maiden_name', label: "Mother's maiden name?" },
  { value: 'favourite_color', label: 'Favourite color?' },
  { value: 'birth_city', label: 'City of birth?' },
  { value: 'childhood_friend', label: 'Childhood best friend?' },
];

const trustBadges = [
  { icon: Shield, text: 'Bank-grade security' },
  { icon: Lock, text: '256-bit encryption' },
  { icon: Zap, text: 'Instant verification' },
];

export default function Register() {
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
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
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
      setSuccess('Registration successful! Check your email (and spam) to activate.');
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      if (err.response?.data) {
        const data = err.response.data;
        if (data.password) setError(data.password[0]);
        else if (data.email) setError(data.email[0]);
        else if (data.id_no) setError(`ID Number: ${data.id_no[0]}`);
        else if (data.username) setError(data.username[0]);
        else if (data.non_field_errors) setError(data.non_field_errors[0]);
        else if (data.detail) setError(data.detail);
        else {
          const firstKey = Object.keys(data)[0];
          if (firstKey) {
            const msg = Array.isArray(data[firstKey]) ? data[firstKey][0] : data[firstKey];
            const key = firstKey.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
            setError(`${key}: ${msg}`);
          } else setError('Registration failed.');
        }
      } else setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-elite-black relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-elite-bg via-elite-surface to-elite-black" />
      <div className="absolute inset-0 bg-gradient-radial opacity-60" />
      <div className="absolute top-0 right-0 w-[600px] h-[500px] bg-gold/5 rounded-full blur-[100px] animate-gradient" />

      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <div className="glass-card rounded-3xl p-8 lg:p-10 shadow-2xl">
            <div className="text-center mb-6">
              <h1 className="text-2xl lg:text-3xl font-display font-heading text-white mb-1">
                Create <span className="text-gold">Account</span>
              </h1>
              <p className="text-elite-text-muted text-sm">Join NextGen Bank</p>
            </div>

            {error && (
              <div className="mb-6 p-4 rounded-xl bg-danger/10 border border-danger/30 text-danger text-sm">
                {error}
              </div>
            )}
            {success && (
              <div className="mb-6 p-4 rounded-xl bg-emerald/10 border border-emerald/30 text-emerald text-sm">
                {success}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="First name"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleChange}
                  required
                />
                <Input
                  label="Last name"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleChange}
                  required
                />
              </div>
              <Input
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
              <Input
                label="ID number (numbers only)"
                name="id_no"
                type="number"
                value={formData.id_no}
                onChange={handleChange}
                required
              />
              <div>
                <label className="block text-sm font-medium text-elite-text-muted mb-1.5">
                  Security question
                </label>
                <select
                  name="security_question"
                  value={formData.security_question}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 rounded-xl bg-elite-surface border border-elite-border text-white focus:border-gold focus:ring-2 focus:ring-gold/20 focus:outline-none"
                >
                  {SECURITY_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
              <Input
                label="Security answer"
                name="security_answer"
                value={formData.security_answer}
                onChange={handleChange}
                required
              />
              <Input
                label="Password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                required
              />
              <Input
                label="Confirm password"
                name="re_password"
                type="password"
                value={formData.re_password}
                onChange={handleChange}
                required
              />
              <Button type="submit" variant="primary" size="lg" className="w-full" loading={loading}>
                {loading ? 'Registering...' : 'Register'}
              </Button>
            </form>

            <p className="text-center text-sm text-elite-text-muted mt-6">
              Already have an account?{' '}
              <Link to="/login" className="text-gold hover:text-gold-light transition-colors">
                Login
              </Link>
            </p>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-8 flex flex-wrap justify-center gap-6"
          >
            {trustBadges.map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-2 text-elite-text-muted text-sm">
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
