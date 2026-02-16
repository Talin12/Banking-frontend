import { useEffect, useState, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  AppShell,
  Card,
  Group,
  Text,
  Title,
  Button,
  Grid,
  Badge,
  Avatar,
  Loader,
  Alert,
  Stack,
  Divider,
  Box,
} from '@mantine/core';
import {
  IconLogout,
  IconSend,
  IconCreditCard,
  IconAlertCircle,
  IconCheck,
  IconX,
  IconUser,
  IconPencil,
} from '@tabler/icons-react';

import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const ROYAL = {
  background: '#0B0E14',
  surface: 'rgba(30, 41, 59, 0.7)',
  border: 'rgba(212, 175, 55, 0.25)',
  borderSilver: 'rgba(226, 232, 240, 0.12)',
  goldGradient: 'linear-gradient(135deg, rgba(212, 175, 55, 0.2) 0%, rgba(245, 208, 169, 0.08) 50%, rgba(30, 58, 95, 0.1) 100%)',
};

const glassStyle = {
  background: ROYAL.surface,
  backdropFilter: 'blur(12px)',
  WebkitBackdropFilter: 'blur(12px)',
  border: `1px solid ${ROYAL.border}`,
};

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchProfile = useCallback(async () => {
    try {
      const response = await api.get('/profiles/my-profile/');
      const data = response.data.profile?.data || response.data.profile || response.data || {};
      setProfile(data);
      setError('');
    } catch (err) {
      console.error(err);
      setError('Failed to load profile data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile, location.key]);

  const hasNextOfKin = profile?.next_of_kin?.length > 0;
  const hasPhotos =
    profile?.photo_url &&
    profile?.id_photo_url &&
    profile?.signature_photo_url;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.08, delayChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 16 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] },
    },
  };

  if (loading) {
    return (
      <Group h="100vh" justify="center" bg={ROYAL.background}>
        <Loader color="gold" size="lg" />
      </Group>
    );
  }

  return (
    <AppShell padding="xl" styles={{ main: { backgroundColor: ROYAL.background } }}>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <Group justify="space-between" mb="xl">
          <Title order={2} fw={600} c="gray.1">
            Dashboard
          </Title>

          <Group>
            <Button
              variant="subtle"
              color="gold"
              leftSection={<IconSend size={16} />}
              onClick={() => navigate('/operations')}
            >
              Transfer
            </Button>
            <Button
              variant="subtle"
              color="gold"
              leftSection={<IconCreditCard size={16} />}
              onClick={() => navigate('/virtual-cards')}
            >
              Virtual Cards
            </Button>
            <Button
              color="red"
              variant="light"
              leftSection={<IconLogout size={16} />}
              onClick={logout}
            >
              Logout
            </Button>
          </Group>
        </Group>

        <Stack>
          {!hasNextOfKin && (
            <motion.div variants={itemVariants}>
              <Alert
                radius="lg"
                icon={<IconAlertCircle />}
                color="orange"
                variant="light"
                title="Action required"
              >
                <Group justify="space-between" align="center" gap="md">
                  <Text size="sm">Add a Next of Kin to activate your account.</Text>
                  <Button
                    size="xs"
                    variant="light"
                    color="orange"
                    onClick={() => navigate('/next-of-kin')}
                  >
                    Add Next of Kin
                  </Button>
                </Group>
              </Alert>
            </motion.div>
          )}

          {hasNextOfKin && !hasPhotos && (
            <motion.div variants={itemVariants}>
              <Alert
                radius="lg"
                icon={<IconAlertCircle />}
                color="blue"
                variant="light"
                title="Verification pending"
              >
                <Group justify="space-between" align="center" gap="md">
                  <Text size="sm">Upload profile photo, ID document and signature.</Text>
                  <Button
                    size="xs"
                    variant="light"
                    color="blue"
                    onClick={() => navigate('/upload-photos')}
                  >
                    Upload Documents
                  </Button>
                </Group>
              </Alert>
            </motion.div>
          )}
        </Stack>

        <motion.div variants={itemVariants}>
          <Card
            mt="xl"
            radius="lg"
            p="xl"
            style={{
              background: ROYAL.goldGradient,
              border: `1px solid ${ROYAL.border}`,
            }}
          >
            <Group justify="space-between">
              <Box>
                <Text size="xs" c="gold.4" tt="uppercase" fw={600}>
                  Welcome back
                </Text>
                <Title order={3} fw={600} c="gray.1">
                  {profile?.full_name || profile?.first_name || user?.first_name || 'User'}
                </Title>
                <Text c="dimmed">{user?.email}</Text>
              </Box>
              <Avatar
                src={profile?.photo_url}
                size={72}
                radius="xl"
                color="gold"
                style={{ border: `2px solid ${ROYAL.border}` }}
              >
                <IconUser size={36} />
              </Avatar>
            </Group>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card mt="xl" radius="lg" p="xl" style={glassStyle}>
            <Group justify="space-between" mb="md">
              <Group gap="sm">
                <Title order={4} c="gray.1">Profile Overview</Title>
                <Badge
                  color={hasPhotos ? 'emerald' : 'orange'}
                  variant="light"
                  radius="sm"
                >
                  {hasPhotos ? 'Verified' : 'Incomplete'}
                </Badge>
              </Group>
              <Button
                variant="light"
                color="gold"
                size="xs"
                leftSection={<IconPencil size={14} />}
                onClick={() => navigate('/edit-profile')}
              >
                Edit Details
              </Button>
            </Group>

            <Divider color={ROYAL.borderSilver} mb="lg" />

            <Grid>
              <Info label="Full Name" value={profile?.full_name} />
              <Info label="Account Number" value={profile?.account_number} />
              <Info label="Username" value={profile?.username} />
              <Info label="Email" value={profile?.email} />
              <Info label="Phone" value={profile?.phone_number} />
              <Info label="City / Country" value={`${profile?.city || '-'}, ${profile?.country || '-'}`} />
              <Info label="Account Type" value={profile?.account_type} />
              <Info label="Currency" value={profile?.account_currency} />
              <Info
                label="Next of Kin"
                value={hasNextOfKin ? <IconCheck color="var(--mantine-color-emerald-5)" /> : <IconX color="var(--mantine-color-red-5)" />}
              />
              <Info
                label="Documents"
                value={hasPhotos ? <IconCheck color="var(--mantine-color-emerald-5)" /> : <IconX color="var(--mantine-color-red-5)" />}
              />
            </Grid>
          </Card>
        </motion.div>

        {error && (
          <motion.div variants={itemVariants}>
            <Alert mt="xl" color="red" variant="light">
              {error}
            </Alert>
          </motion.div>
        )}
      </motion.div>
    </AppShell>
  );
};

const Info = ({ label, value }) => (
  <Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
    <Stack gap={4}>
      <Text size="xs" c="dimmed" tt="uppercase">
        {label}
      </Text>
      <Text fw={500} c="gray.1">{value !== undefined && value !== null && value !== '' ? value : '—'}</Text>
    </Stack>
  </Grid.Col>
);

export default Dashboard;
