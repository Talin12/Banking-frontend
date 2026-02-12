import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Title,
  Text,
  Paper,
  Group,
  Button,
  Stack,
  FileButton,
  Image,
  Center,
  Loader,
  Alert,
  Box,
  ThemeIcon,
  SimpleGrid,
  Badge,
} from '@mantine/core';
import { 
  IconUpload, 
  IconPhoto, 
  IconId, 
  IconWritingSign, 
  IconArrowLeft, 
  IconCheck,
  IconX
} from '@tabler/icons-react';
import api from '../services/api';

const ProfilePhotos = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState(null);
  
  // Existing profile data
  const [userProfile, setUserProfile] = useState(null);

  // New file uploads
  const [files, setFiles] = useState({
    photo: null,
    id_photo: null,
    signature_photo: null,
  });

  // Previews for NEW files
  const [previews, setPreviews] = useState({
    photo: null,
    id_photo: null,
    signature_photo: null,
  });

  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    try {
      const response = await api.get('/profiles/my-profile/');
      // Handle various response structures based on your backend
      const profileData = response.data.profile?.data || response.data.profile || response.data || response.data.data;
      setUserProfile(profileData);
    } catch (err) {
      console.error("Failed to fetch profile", err);
    } finally {
      setFetching(false);
    }
  };

  const handleFileChange = (file, type) => {
    if (file) {
      setFiles((prev) => ({ ...prev, [type]: file }));
      setPreviews((prev) => ({ ...prev, [type]: URL.createObjectURL(file) }));
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);

    const formData = new FormData();
    if (files.photo) formData.append('photo', files.photo);
    if (files.id_photo) formData.append('id_photo', files.id_photo);
    if (files.signature_photo) formData.append('signature_photo', files.signature_photo);

    if (!files.photo && !files.id_photo && !files.signature_photo) {
        setError("Please select at least one document to upload.");
        setLoading(false);
        return;
    }

    try {
      await api.patch('/profiles/my-profile/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      // Reload to show new images
      window.location.reload();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.detail || 'Failed to upload documents.');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
      return <Center h="100vh"><Loader /></Center>;
  }

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

        <Stack gap="lg">
          <Box>
            <Title order={2}>Account Verification</Title>
            <Text c="dimmed">Please upload the required documents to verify your identity.</Text>
          </Box>

          {error && (
            <Alert icon={<IconX size={16} />} title="Upload Failed" color="red">
              {error}
            </Alert>
          )}

          <SimpleGrid cols={{ base: 1, md: 3 }} spacing="lg">
            {/* 1. Profile Photo */}
            <UploadCard
              title="Profile Photo"
              description="A clear photo of your face."
              icon={<IconPhoto size={30} />}
              file={files.photo}
              newPreview={previews.photo}
              existingUrl={userProfile?.photo_url}
              onFileChange={(file) => handleFileChange(file, 'photo')}
              accept="image/png,image/jpeg"
            />

            {/* 2. ID Document */}
            <UploadCard
              title="ID Document"
              description="Passport or National ID card."
              icon={<IconId size={30} />}
              file={files.id_photo}
              newPreview={previews.id_photo}
              existingUrl={userProfile?.id_photo_url}
              onFileChange={(file) => handleFileChange(file, 'id_photo')}
              accept="image/png,image/jpeg,application/pdf"
            />

            {/* 3. Signature */}
            <UploadCard
              title="Signature"
              description="Photo of your signature."
              icon={<IconWritingSign size={30} />}
              file={files.signature_photo}
              newPreview={previews.signature_photo}
              existingUrl={userProfile?.signature_photo_url}
              onFileChange={(file) => handleFileChange(file, 'signature_photo')}
              accept="image/png,image/jpeg"
              isSignature
            />
          </SimpleGrid>

          <Group justify="flex-end" mt="xl">
            <Button 
              size="md" 
              onClick={handleSubmit} 
              loading={loading} 
              leftSection={<IconUpload size={20} />}
              disabled={!files.photo && !files.id_photo && !files.signature_photo}
            >
              Upload Selected Documents
            </Button>
          </Group>
        </Stack>
      </Container>
    </Box>
  );
};

// Helper Component
const UploadCard = ({ title, description, icon, file, newPreview, existingUrl, onFileChange, accept, isSignature }) => {
    // Determine what image to show: New Preview > Existing URL > Placeholder
    const showImage = newPreview || existingUrl;
    const isNew = !!newPreview;

    return (
        <Paper shadow="sm" radius="md" p="xl" withBorder style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <Stack align="center" gap="md" style={{ flex: 1 }}>
                <Group justify="space-between" w="100%">
                    <ThemeIcon size={40} radius="xl" variant="light" color="blue">
                        {icon}
                    </ThemeIcon>
                    {existingUrl && !isNew && <Badge color="green" variant="light">Uploaded</Badge>}
                    {isNew && <Badge color="orange" variant="light">Pending</Badge>}
                </Group>
                
                <div style={{ textAlign: 'center' }}>
                    <Text fw={600}>{title}</Text>
                    <Text size="xs" c="dimmed" style={{ lineHeight: 1.2 }}>{description}</Text>
                </div>

                {showImage ? (
                    <Box 
                    style={{ 
                        width: '100%', 
                        height: 120, 
                        borderRadius: 8, 
                        overflow: 'hidden', 
                        border: '1px solid #eee',
                        position: 'relative',
                        backgroundColor: '#fff'
                    }}
                    >
                    <Image 
                        src={showImage} 
                        h="100%" 
                        w="100%" 
                        fit={isSignature ? "contain" : "cover"} 
                    />
                    </Box>
                ) : (
                    <Center 
                    style={{ 
                        width: '100%', 
                        height: 120, 
                        backgroundColor: '#f8f9fa', 
                        borderRadius: 8, 
                        border: '1px dashed #ced4da' 
                    }}
                    >
                    <Text size="xs" c="dimmed">No file</Text>
                    </Center>
                )}

                <FileButton onChange={onFileChange} accept={accept}>
                    {(props) => (
                    <Button {...props} variant="light" size="xs" fullWidth mt="auto">
                        {file ? 'Change File' : 'Select File'}
                    </Button>
                    )}
                </FileButton>
            </Stack>
        </Paper>
    );
};

export default ProfilePhotos;