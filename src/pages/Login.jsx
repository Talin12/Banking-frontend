import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Container,
  Paper,
  Title,
  Text,
  TextInput,
  PasswordInput,
  Button,
  Stack,
  Alert,
  Box,
} from '@mantine/core';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const ROYAL = {
  surface: 'rgba(30, 41, 59, 0.7)',
  border: 'rgba(212, 175, 55, 0.25)',
};

const getErrorMessage = (err) => {
  if (err.response && err.response.data) {
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
};

const Login = () => {
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

  const cardVariants = {
    hidden: { opacity: 0, y: 24 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] },
    },
  };

  const formVariants = {
    hidden: { opacity: 0, x: -12 },
    visible: (i) => ({
      opacity: 1,
      x: 0,
      transition: { delay: i * 0.06, duration: 0.3 },
    }),
  };

  return (
    <Box py={100} style={{ minHeight: '100vh' }}>
      <Container size="xs">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={cardVariants}
        >
          <Paper
            p="xl"
            radius="lg"
            style={{
              background: ROYAL.surface,
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              border: `1px solid ${ROYAL.border}`,
            }}
          >
            <Title order={1} ta="center" mb="md" fw={600} c="gold.4">
              NextGen Bank
            </Title>
            <Text ta="center" c="dimmed" size="sm" mb="lg">
              Sign in to your account
            </Text>

            <AnimatePresence mode="wait">
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <Alert color="red" variant="light" radius="md" mb="lg">
                    {error}
                  </Alert>
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence mode="wait">
              {step === 1 ? (
                <motion.form
                  key="credentials"
                  onSubmit={handleCredentials}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 16 }}
                  transition={{ duration: 0.3 }}
                >
                  <Stack gap="md">
                    <motion.div custom={0} variants={formVariants} initial="hidden" animate="visible">
                      <TextInput
                        label="Email"
                        type="email"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        size="md"
                        radius="md"
                      />
                    </motion.div>
                    <motion.div custom={1} variants={formVariants} initial="hidden" animate="visible">
                      <PasswordInput
                        label="Password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        size="md"
                        radius="md"
                      />
                    </motion.div>
                    <motion.div custom={2} variants={formVariants} initial="hidden" animate="visible">
                      <Button
                        type="submit"
                        fullWidth
                        size="md"
                        loading={loading}
                        color="gold"
                        variant="filled"
                        radius="md"
                        style={{ boxShadow: '0 0 20px rgba(212, 175, 55, 0.25)' }}
                      >
                        {loading ? 'Sending OTP...' : 'Continue'}
                      </Button>
                    </motion.div>
                  </Stack>
                </motion.form>
              ) : (
                <motion.form
                  key="otp"
                  onSubmit={handleOTP}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 16 }}
                  transition={{ duration: 0.3 }}
                >
                  <Alert color="emerald" variant="light" radius="md" mb="lg">
                    OTP sent to {email}. Check your email (and spam folder).
                  </Alert>
                  <Stack gap="md">
                    <TextInput
                      label="Enter OTP"
                      placeholder="000000"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      required
                      maxLength={6}
                      size="md"
                      radius="md"
                      styles={{ input: { letterSpacing: 6, fontSize: 18 } }}
                    />
                    <Button
                      type="submit"
                      fullWidth
                      size="md"
                      loading={loading}
                      color="emerald"
                      variant="filled"
                      radius="md"
                    >
                      {loading ? 'Verifying...' : 'Verify & Login'}
                    </Button>
                    <Button
                      type="button"
                      fullWidth
                      variant="subtle"
                      color="gray"
                      size="md"
                      onClick={() => setStep(1)}
                    >
                      Back
                    </Button>
                  </Stack>
                </motion.form>
              )}
            </AnimatePresence>

            <Text ta="center" mt="lg" size="sm" c="dimmed">
              Don&apos;t have an account?{' '}
              <Link to="/register" style={{ color: 'var(--mantine-color-gold-4)' }}>
                Register here
              </Link>
            </Text>
          </Paper>
        </motion.div>
      </Container>
    </Box>
  );
};

export default Login;
