import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Container,
  Paper,
  Title,
  Text,
  TextInput,
  PasswordInput,
  Select,
  Button,
  Stack,
  Alert,
  Box,
} from '@mantine/core';
import api from '../services/api';

const ROYAL = {
  surface: 'rgba(30, 41, 59, 0.7)',
  border: 'rgba(212, 175, 55, 0.25)',
};

const SECURITY_OPTIONS = [
  { value: '', label: 'Select a question...' },
  { value: 'maiden_name', label: "What is your mother's maiden name?" },
  { value: 'favourite_color', label: 'What is your favourite color?' },
  { value: 'birth_city', label: 'What is the city where you were born?' },
  { value: 'childhood_friend', label: 'What is the name of your childhood best friend?' },
];

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
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (value) => {
    setFormData((prev) => ({ ...prev, security_question: value ?? '' }));
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
      if (err.response?.data) {
        const data = err.response.data;
        if (data.password) setError(data.password[0]);
        else if (data.email) setError(data.email[0]);
        else if (data.id_no) setError(`ID Number: ${data.id_no[0]}`);
        else if (data.username) setError(data.username[0]);
        else if (data.non_field_errors) setError(data.non_field_errors[0]);
        else if (data.detail) setError(data.detail);
        else {
          const firstErrorKey = Object.keys(data)[0];
          if (firstErrorKey) {
            const errorMsg = Array.isArray(data[firstErrorKey])
              ? data[firstErrorKey][0]
              : data[firstErrorKey];
            const formattedKey = firstErrorKey
              .replace('_', ' ')
              .replace(/\b\w/g, (c) => c.toUpperCase());
            setError(`${formattedKey}: ${errorMsg}`);
          } else setError('Registration failed. Please try again.');
        }
      } else setError('Network error. Please try again later.');
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

  return (
    <Box py={50} style={{ minHeight: '100vh' }}>
      <Container size="xs">
        <motion.div initial="hidden" animate="visible" variants={cardVariants}>
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
            <Title order={1} ta="center" mb="xs" fw={600} c="gold.4">
              Create Account
            </Title>
            <Text ta="center" c="dimmed" size="sm" mb="lg">
              Join NextGen Bank
            </Text>

            {error && (
              <Alert color="red" variant="light" radius="md" mb="lg">
                {error}
              </Alert>
            )}
            {success && (
              <Alert color="emerald" variant="light" radius="md" mb="lg">
                {success}
              </Alert>
            )}

            <form onSubmit={handleSubmit}>
              <Stack gap="md">
                <TextInput
                  label="First Name"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleChange}
                  required
                  size="md"
                  radius="md"
                />
                <TextInput
                  label="Last Name"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleChange}
                  required
                  size="md"
                  radius="md"
                />
                <TextInput
                  label="Email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  size="md"
                  radius="md"
                />
                <TextInput
                  label="ID Number (numbers only)"
                  name="id_no"
                  type="number"
                  value={formData.id_no}
                  onChange={handleChange}
                  required
                  size="md"
                  radius="md"
                />
                <Select
                  label="Security Question"
                  placeholder="Select a question..."
                  data={SECURITY_OPTIONS}
                  value={formData.security_question || null}
                  onChange={handleSelectChange}
                  required
                  size="md"
                  radius="md"
                />
                <TextInput
                  label="Security Answer"
                  name="security_answer"
                  value={formData.security_answer}
                  onChange={handleChange}
                  required
                  size="md"
                  radius="md"
                />
                <PasswordInput
                  label="Password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  size="md"
                  radius="md"
                />
                <PasswordInput
                  label="Confirm Password"
                  name="re_password"
                  value={formData.re_password}
                  onChange={handleChange}
                  required
                  size="md"
                  radius="md"
                />
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
                  {loading ? 'Registering...' : 'Register'}
                </Button>
              </Stack>
            </form>

            <Text ta="center" mt="lg" size="sm" c="dimmed">
              Already have an account?{' '}
              <Link to="/login" style={{ color: 'var(--mantine-color-gold-4)' }}>
                Login here
              </Link>
            </Text>
          </Paper>
        </motion.div>
      </Container>
    </Box>
  );
};

export default Register;
