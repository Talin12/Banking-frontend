import { useEffect, useState } from 'react';
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
  Tabs,
  Alert,
} from '@mantine/core';
import {
  IconDeviceFloppy,
  IconArrowLeft,
  IconUser,
  IconBriefcase,
  IconId,
  IconMapPin,
} from '@tabler/icons-react';
import api from '../services/api';

const EditProfile = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [error, setError] = useState(null);

  const form = useForm({
    initialValues: {
      // Personal
      title: '',
      first_name: '',
      middle_name: '',
      last_name: '',
      gender: '',
      date_of_birth: '',
      marital_status: '',
      
      // Contact
      phone_number: '',
      address: '',
      city: '',
      country: '',
      
      // Identification
      nationality: '',
      country_of_birth: '',
      place_of_birth: '',
      means_of_identification: '',
      passport_number: '',
      id_issue_date: '',
      id_expiry_date: '',
      
      // Employment
      employment_status: '',
      employer_name: '',
      employer_address: '',
      employer_city: '',
      employer_state: '',
      date_of_employment: '',
      annual_income: '',

      // Account
      account_currency: '',
      account_type: '',
    },
    validate: {
      first_name: (value) => (value?.length < 2 ? 'First name is too short' : null),
      last_name: (value) => (value?.length < 2 ? 'Last name is too short' : null),
      phone_number: (value) => (value?.length < 5 ? 'Invalid phone number' : null),
    },
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await api.get('/profiles/my-profile/');
      const data = response.data.profile?.data || response.data.profile || response.data || {};
      
      // Map backend fields to form, converting nulls to empty strings
      const sanitizedData = {};
      Object.keys(form.values).forEach(key => {
        sanitizedData[key] = data[key] === null || data[key] === undefined ? '' : data[key];
      });
      
      form.setValues(sanitizedData);
    } catch (error) {
      console.error('Failed to load profile', error);
      setError('Could not load existing profile data.');
    } finally {
      setFetchLoading(false);
    }
  };

  const handleSubmit = async (values) => {
    setLoading(true);
    setError(null);
    try {
      // Clean payload: Convert empty strings back to null for dates to avoid validation errors
      const payload = { ...values };
      const dateFields = ['date_of_birth', 'id_issue_date', 'id_expiry_date', 'date_of_employment'];
      
      Object.keys(payload).forEach(key => {
        if (payload[key] === '') {
          if (dateFields.includes(key)) {
            payload[key] = null;
          } 
        }
      });

      await api.patch('/profiles/my-profile/', payload);
      navigate('/dashboard');
    } catch (error) {
      console.error('Failed to update profile', error);
      const msg = error.response?.data?.message || error.response?.data?.detail || 'Failed to update profile.';
      setError(msg);

      if (error.response?.data) {
         const backendErrors = error.response.data;
         const formErrors = {};
         
         // Helper to handle nested error structures
         const extractError = (err) => Array.isArray(err) ? err[0] : err;

         if (backendErrors.errors) {
            // Handle { errors: { field: [] } } format
            Object.keys(backendErrors.errors).forEach(key => {
                if(key in values) formErrors[key] = extractError(backendErrors.errors[key]);
            });
         } else {
            // Handle { field: [] } format
            Object.keys(backendErrors).forEach(key => {
                if(key in values) formErrors[key] = extractError(backendErrors[key]);
            });
         }
         
         form.setErrors(formErrors);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box bg="gray.0" mih="100vh" py="xl">
      <Container size="md">
        <Button 
          variant="subtle" 
          color="gray" 
          mb="md" 
          leftSection={<IconArrowLeft size={16} />}
          onClick={() => navigate('/dashboard')}
        >
          Back to Dashboard
        </Button>

        <Paper shadow="sm" radius="md" p="xl" pos="relative">
          <LoadingOverlay visible={fetchLoading || loading} overlayProps={{ radius: 'sm', blur: 2 }} />
          
          <Group mb="xl" justify="space-between">
            <div>
              <Title order={2}>Edit Profile</Title>
              <Text c="dimmed" size="sm">
                Update your personal and account information.
              </Text>
            </div>
          </Group>

          {error && (
            <Alert color="red" mb="lg" title="Error">
              {error}
            </Alert>
          )}

          <form onSubmit={form.onSubmit(handleSubmit)}>
            <Tabs defaultValue="personal" variant="outline" radius="md">
              <Tabs.List mb="lg">
                <Tabs.Tab value="personal" leftSection={<IconUser size={16} />}>
                  Personal
                </Tabs.Tab>
                <Tabs.Tab value="contact" leftSection={<IconMapPin size={16} />}>
                  Contact
                </Tabs.Tab>
                <Tabs.Tab value="identity" leftSection={<IconId size={16} />}>
                  Identity
                </Tabs.Tab>
                <Tabs.Tab value="employment" leftSection={<IconBriefcase size={16} />}>
                  Employment
                </Tabs.Tab>
              </Tabs.List>

              <Tabs.Panel value="personal">
                <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
                  <Select
                    label="Title"
                    data={[
                      { value: 'mr', label: 'Mr' },
                      { value: 'mrs', label: 'Mrs' },
                      { value: 'miss', label: 'Miss' }
                    ]}
                    {...form.getInputProps('title')}
                  />
                  <Select
                    label="Gender"
                    data={[
                      { value: 'male', label: 'Male' },
                      { value: 'female', label: 'Female' }
                    ]}
                    {...form.getInputProps('gender')}
                  />
                  <TextInput
                    label="First Name"
                    withAsterisk
                    {...form.getInputProps('first_name')}
                  />
                  <TextInput
                    label="Middle Name"
                    {...form.getInputProps('middle_name')}
                  />
                  <TextInput
                    label="Last Name"
                    withAsterisk
                    {...form.getInputProps('last_name')}
                  />
                  <TextInput
                    type="date"
                    label="Date of Birth"
                    {...form.getInputProps('date_of_birth')}
                  />
                  <Select
                    label="Marital Status"
                    data={[
                      { value: 'single', label: 'Single' },
                      { value: 'married', label: 'Married' },
                      { value: 'divorced', label: 'Divorced' },
                      { value: 'widowed', label: 'Widowed' },
                      { value: 'separated', label: 'Separated' }
                    ]}
                    {...form.getInputProps('marital_status')}
                  />
                </SimpleGrid>
              </Tabs.Panel>

              <Tabs.Panel value="contact">
                <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
                  <TextInput
                    label="Phone Number"
                    withAsterisk
                    placeholder="+123456789"
                    {...form.getInputProps('phone_number')}
                  />
                  <TextInput
                    label="City"
                    {...form.getInputProps('city')}
                  />
                   <TextInput
                    label="Country"
                    {...form.getInputProps('country')}
                  />
                  <TextInput
                    label="Address"
                    {...form.getInputProps('address')}
                    style={{ gridColumn: 'span 2' }} 
                  />
                </SimpleGrid>
              </Tabs.Panel>

              <Tabs.Panel value="identity">
                <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
                  <TextInput
                    label="Nationality"
                    {...form.getInputProps('nationality')}
                  />
                   <TextInput
                    label="Country of Birth"
                    {...form.getInputProps('country_of_birth')}
                  />
                  <TextInput
                    label="Place of Birth"
                    {...form.getInputProps('place_of_birth')}
                  />
                   <Select
                    label="Means of Identification"
                    data={[
                      { value: 'passport', label: 'Passport' },
                      { value: 'national_id', label: 'National ID' },
                      { value: 'drivers_license', label: 'Drivers License' }
                    ]}
                    {...form.getInputProps('means_of_identification')}
                  />
                  <TextInput
                    label="ID / Passport Number"
                    {...form.getInputProps('passport_number')}
                  />
                   <Group grow>
                    <TextInput
                        type="date"
                        label="ID Issue Date"
                        {...form.getInputProps('id_issue_date')}
                    />
                    <TextInput
                        type="date"
                        label="ID Expiry Date"
                        {...form.getInputProps('id_expiry_date')}
                    />
                   </Group>
                </SimpleGrid>
              </Tabs.Panel>

              <Tabs.Panel value="employment">
                <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
                   <Select
                    label="Employment Status"
                    data={[
                      { value: 'employed', label: 'Employed' },
                      { value: 'self_employed', label: 'Self Employed' },
                      { value: 'unemployed', label: 'Unemployed' },
                      { value: 'student', label: 'Student' },
                      { value: 'retired', label: 'Retired' }
                    ]}
                    {...form.getInputProps('employment_status')}
                  />
                  <TextInput
                    label="Employer Name"
                    {...form.getInputProps('employer_name')}
                  />
                  <TextInput
                    label="Annual Income"
                    {...form.getInputProps('annual_income')}
                  />
                   <TextInput
                    type="date"
                    label="Date of Employment"
                    {...form.getInputProps('date_of_employment')}
                  />
                  <TextInput
                    label="Employer City"
                    {...form.getInputProps('employer_city')}
                  />
                  <TextInput
                    label="Employer State"
                    {...form.getInputProps('employer_state')}
                  />
                  <TextInput
                    label="Employer Address"
                    {...form.getInputProps('employer_address')}
                    style={{ gridColumn: 'span 2' }}
                  />
                </SimpleGrid>
              </Tabs.Panel>
            </Tabs>

            <Group justify="flex-end" mt="xl">
              <Button variant="default" onClick={() => navigate('/dashboard')}>
                Cancel
              </Button>
              <Button type="submit" leftSection={<IconDeviceFloppy size={18} />}>
                Save Changes
              </Button>
            </Group>
          </form>
        </Paper>
      </Container>
    </Box>
  );
};

export default EditProfile;