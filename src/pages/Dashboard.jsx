import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
} from '@tabler/icons-react';

import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await api.get('/profiles/my-profile/');
      setProfile(response.data.profile?.data || response.data.profile || response.data);
    } catch {
      setError('Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  const hasNextOfKin = profile?.next_of_kin?.length > 0;
  const hasPhotos =
    profile?.photo_url &&
    profile?.id_photo_url &&
    profile?.signature_photo_url;

  if (loading) {
    return (
      <Group h="100vh" justify="center">
        <Loader size="lg" />
      </Group>
    );
  }

  return (
    <AppShell padding="xl">
      {/* HEADER */}
      <Group justify="space-between" mb="xl">
        <Title order={2} fw={600}>
          Dashboard
        </Title>

        <Group>
          <Button
            variant="subtle"
            leftSection={<IconSend size={16} />}
            onClick={() => navigate('/operations')}
          >
            Transfer
          </Button>

          <Button
            variant="subtle"
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

      {/* ALERTS */}
      <Stack>
        {!hasNextOfKin && (
          <Alert
            radius="lg"
            icon={<IconAlertCircle />}
            color="orange"
            title="Action required"
          >
            <Group justify="space-between" align="center" gap="md">
              <Text size="sm">Add a Next of Kin to activate your account.</Text>
              <Button
                size="xs"
                variant="white"
                color="orange"
                onClick={() => navigate('/next-of-kin')}
              >
                Add Next of Kin
              </Button>
            </Group>
          </Alert>
        )}

        {hasNextOfKin && !hasPhotos && (
          <Alert
            radius="lg"
            icon={<IconAlertCircle />}
            color="blue"
            title="Verification pending"
          >
            <Group justify="space-between" align="center" gap="md">
              <Text size="sm">Upload profile photo, ID document and signature.</Text>
              <Button
                size="xs"
                variant="white"
                color="blue"
                onClick={() => navigate('/upload-photos')}
              >
                Upload Documents
              </Button>
            </Group>
          </Alert>
        )}
      </Stack>

      {/* WELCOME */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        <Card
          mt="xl"
          radius="lg"
          p="xl"
          style={{
            background:
              'linear-gradient(135deg, rgba(59,130,246,0.15), rgba(99,102,241,0.05))',
          }}
        >
          <Group justify="space-between">
            <Box>
              <Text size="xs" c="dimmed" tt="uppercase">
                Welcome back
              </Text>
              <Title order={3} fw={600}>
                {profile?.first_name || user?.first_name || 'User'}
              </Title>
              <Text c="dimmed">{user?.email}</Text>
            </Box>

            <Avatar
              src={profile?.photo_url}
              size={72}
              radius="xl"
            >
              <IconUser />
            </Avatar>
          </Group>
        </Card>
      </motion.div>

      {/* PROFILE */}
      <Card mt="xl" radius="lg" p="xl">
        <Group justify="space-between" mb="md">
          <Title order={4}>Profile Overview</Title>
          <Badge
            color={hasPhotos ? 'green' : 'orange'}
            variant="light"
            radius="sm"
          >
            {hasPhotos ? 'Verified' : 'Incomplete'}
          </Badge>
        </Group>

        <Divider mb="lg" />

        <Grid>
          <Info label="Full Name" value={profile?.full_name} />
          <Info label="Account Number" value={profile?.account_number} />
          <Info label="Username" value={profile?.username} />
          <Info label="Email" value={profile?.email} />
          <Info label="Phone" value={profile?.phone_number} />
          <Info label="City / Country" value={`${profile?.city}, ${profile?.country}`} />
          <Info label="Account Type" value={profile?.account_type} />
          <Info label="Currency" value={profile?.account_currency} />
          <Info
            label="Next of Kin"
            value={hasNextOfKin ? <IconCheck color="green" /> : <IconX color="red" />}
          />
          <Info
            label="Documents"
            value={hasPhotos ? <IconCheck color="green" /> : <IconX color="red" />}
          />
        </Grid>
      </Card>

      {error && (
        <Alert mt="xl" color="red">
          {error}
        </Alert>
      )}
    </AppShell>
  );
};

const Info = ({ label, value }) => (
  <Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
    <Stack gap={4}>
      <Text size="xs" c="dimmed" tt="uppercase">
        {label}
      </Text>
      <Text fw={500}>{value || '—'}</Text>
    </Stack>
  </Grid.Col>
);

export default Dashboard;