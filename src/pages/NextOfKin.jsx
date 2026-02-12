import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from '@mantine/form';
import {
  Container,
  Title,
  TextInput,
  Button,
  Group,
  Select,
  Paper,
  Text,
  LoadingOverlay,
  SimpleGrid,
  Box,
  Card,
  ActionIcon,
  Drawer,
  Stack,
  Badge,
  Alert,
} from '@mantine/core';
import {
  IconPlus,
  IconTrash,
  IconEdit,
  IconArrowLeft,
  IconUserHeart,
  IconPhone,
  IconMapPin,
  IconMail,
  IconAlertCircle,
} from '@tabler/icons-react';
import { useDisclosure } from '@mantine/hooks';
import api from '../services/api';

const NextOfKin = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [listLoading, setListLoading] = useState(true);
  const [nextOfKinList, setNextOfKinList] = useState([]);
  const [error, setError] = useState(null);
  const [editingId, setEditingId] = useState(null);
  
  // Controls the Form Drawer
  const [opened, { open, close }] = useDisclosure(false);

  const form = useForm({
    initialValues: {
      title: '',
      first_name: '',
      last_name: '',
      other_names: '',
      gender: '',
      date_of_birth: '',
      relationship: '',
      phone_number: '',
      email_address: '',
      address: '',
      city: '',
      country: '',
    },
    validate: {
      first_name: (value) => (value.length < 2 ? 'First name is too short' : null),
      last_name: (value) => (value.length < 2 ? 'Last name is too short' : null),
      relationship: (value) => (value ? null : 'Relationship is required'),
      phone_number: (value) => (value.length < 5 ? 'Invalid phone number' : null),
      email_address: (value) => (/^\S+@\S+$/.test(value) ? null : 'Invalid email'),
    },
  });

  useEffect(() => {
    fetchNextOfKin();
  }, []);

  const fetchNextOfKin = async () => {
    setListLoading(true);
    try {
      const response = await api.get('/profiles/my-profile/next-of-kin/');
      let data = response.data;
      if (data && data.next_of_kin) data = data.next_of_kin;
      const list = data.results || (Array.isArray(data) ? data : []);
      setNextOfKinList(list);
    } catch (err) {
      console.error(err);
      setError('Failed to load contacts.');
    } finally {
      setListLoading(false);
    }
  };

  const handleSubmit = async (values) => {
    setLoading(true);
    setError(null);
    try {
      if (editingId) {
        await api.put(`/profiles/my-profile/next-of-kin/${editingId}/`, values);
      } else {
        await api.post('/profiles/my-profile/next-of-kin/', values);
      }
      await fetchNextOfKin();
      handleCloseDrawer();
    } catch (err) {
      console.error(err);
      // Extract backend errors if available
      const backendErrors = err.response?.data;
      if (backendErrors && typeof backendErrors === 'object') {
        // Map backend field errors to form
        const fieldErrors = {};
        Object.keys(backendErrors).forEach((key) => {
           // Handle specific field errors or general errors
           if (key in values) {
             fieldErrors[key] = Array.isArray(backendErrors[key]) ? backendErrors[key][0] : backendErrors[key];
           }
        });
        form.setErrors(fieldErrors);
        
        // General error message if needed
        if (backendErrors.detail) setError(backendErrors.detail);
        else if (!Object.keys(fieldErrors).length) setError('Failed to save information.');
      } else {
        setError('An unexpected error occurred.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (kin) => {
    setEditingId(kin.id);
    form.setValues({
      title: kin.title || '',
      first_name: kin.first_name || '',
      last_name: kin.last_name || '',
      other_names: kin.other_names || '',
      gender: kin.gender || '',
      date_of_birth: kin.date_of_birth || '',
      relationship: kin.relationship || '',
      phone_number: kin.phone_number || '',
      email_address: kin.email_address || '',
      address: kin.address || '',
      city: kin.city || '',
      country: kin.country || '',
    });
    open();
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this contact?')) return;
    try {
      await api.delete(`/profiles/my-profile/next-of-kin/${id}/`);
      fetchNextOfKin();
    } catch (err) {
      console.error(err);
      setError('Failed to delete contact.');
    }
  };

  const handleCloseDrawer = () => {
    close();
    setEditingId(null);
    form.reset();
    setError(null);
  };

  return (
    <Box bg="gray.0" mih="100vh" py="xl">
      <Container size="lg">
        {/* Header Section */}
        <Group justify="space-between" mb="lg">
          <Button 
            variant="subtle" 
            color="gray" 
            leftSection={<IconArrowLeft size={16} />}
            onClick={() => navigate('/dashboard')}
          >
            Dashboard
          </Button>
          <Button 
            leftSection={<IconPlus size={16} />} 
            onClick={() => { setEditingId(null); form.reset(); open(); }}
          >
            Add Contact
          </Button>
        </Group>

        <Title order={2} mb="xs">Next of Kin</Title>
        <Text c="dimmed" mb="xl">Manage your emergency contacts and beneficiaries.</Text>

        {error && <Alert color="red" icon={<IconAlertCircle />} mb="lg">{error}</Alert>}

        {/* List View */}
        <Box pos="relative" minHeight={200}>
          <LoadingOverlay visible={listLoading} overlayProps={{ radius: 'sm', blur: 2 }} />
          
          {nextOfKinList.length === 0 && !listLoading ? (
             <Paper p="xl" withBorder ta="center" bg="gray.0">
               <IconUserHeart size={48} color="#adb5bd" style={{ marginBottom: 15 }} />
               <Text c="dimmed">No contacts added yet.</Text>
               <Button variant="light" mt="md" onClick={open}>Add your first contact</Button>
             </Paper>
          ) : (
            <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="lg">
              {nextOfKinList.map((kin) => (
                <Card key={kin.id} shadow="sm" padding="lg" radius="md" withBorder>
                  <Group justify="space-between" mb="xs">
                    <Badge color="blue" variant="light">{kin.relationship}</Badge>
                    <Group gap="xs">
                      <ActionIcon variant="subtle" color="blue" onClick={() => handleEdit(kin)}>
                        <IconEdit size={16} />
                      </ActionIcon>
                      <ActionIcon variant="subtle" color="red" onClick={() => handleDelete(kin.id)}>
                        <IconTrash size={16} />
                      </ActionIcon>
                    </Group>
                  </Group>

                  <Text fw={600} size="lg" mt="xs">
                    {kin.title} {kin.first_name} {kin.last_name}
                  </Text>
                  <Text size="sm" c="dimmed" mb="md">
                    {kin.other_names}
                  </Text>

                  <Stack gap="xs">
                    <Group gap="xs">
                      <IconPhone size={14} color="gray" />
                      <Text size="sm">{kin.phone_number}</Text>
                    </Group>
                    <Group gap="xs">
                      <IconMail size={14} color="gray" />
                      <Text size="sm" style={{ wordBreak: 'break-all' }}>{kin.email_address}</Text>
                    </Group>
                    <Group gap="xs" align="flex-start">
                      <IconMapPin size={14} color="gray" style={{ marginTop: 4 }} />
                      <Text size="sm">
                        {kin.address}, {kin.city}, {kin.country}
                      </Text>
                    </Group>
                  </Stack>
                </Card>
              ))}
            </SimpleGrid>
          )}
        </Box>

        {/* Add/Edit Drawer Form */}
        <Drawer
          opened={opened}
          onClose={handleCloseDrawer}
          title={<Text fw={600} size="lg">{editingId ? 'Edit Contact' : 'New Contact'}</Text>}
          position="right"
          size="md"
          padding="xl"
        >
          <form onSubmit={form.onSubmit(handleSubmit)}>
            <Stack gap="md">
              <Group grow>
                <Select
                  label="Title"
                  data={['Mr', 'Mrs', 'Miss', 'Ms', 'Dr', 'Prof']}
                  {...form.getInputProps('title')}
                />
                <Select
                  label="Gender"
                  data={['Male', 'Female', 'Other']}
                  {...form.getInputProps('gender')}
                />
              </Group>

              <Group grow>
                <TextInput
                  withAsterisk
                  label="First Name"
                  {...form.getInputProps('first_name')}
                />
                <TextInput
                  withAsterisk
                  label="Last Name"
                  {...form.getInputProps('last_name')}
                />
              </Group>

              <TextInput
                label="Other Names"
                {...form.getInputProps('other_names')}
              />

              <Group grow>
                <TextInput
                  withAsterisk
                  label="Relationship"
                  placeholder="e.g. Spouse"
                  {...form.getInputProps('relationship')}
                />
                <TextInput
                  type="date"
                  label="Date of Birth"
                  {...form.getInputProps('date_of_birth')}
                />
              </Group>

              <TextInput
                withAsterisk
                label="Phone Number"
                placeholder="+1 234 567 890"
                {...form.getInputProps('phone_number')}
              />

              <TextInput
                withAsterisk
                label="Email Address"
                placeholder="email@example.com"
                {...form.getInputProps('email_address')}
              />

              <TextInput
                label="Address"
                {...form.getInputProps('address')}
              />

              <Group grow>
                <TextInput
                  label="City"
                  {...form.getInputProps('city')}
                />
                <TextInput
                  label="Country"
                  {...form.getInputProps('country')}
                />
              </Group>

              <Button type="submit" mt="xl" loading={loading} fullWidth>
                {editingId ? 'Save Changes' : 'Create Contact'}
              </Button>
            </Stack>
          </form>
        </Drawer>
      </Container>
    </Box>
  );
};

export default NextOfKin;