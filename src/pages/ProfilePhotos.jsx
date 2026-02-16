import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Upload, Image, IdCard, PenLine, X } from 'lucide-react';
import api from '../services/api';
import { Button } from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { PageTransition } from '../components/layout/PageTransition';

function getErrorMessage(err, defaultMsg) {
  if (err.response?.data) {
    const data = err.response.data;
    if (data.detail) return data.detail;
    if (data.non_field_errors) return data.non_field_errors[0];
    const firstKey = Object.keys(data)[0];
    if (firstKey) {
      const msg = Array.isArray(data[firstKey]) ? data[firstKey][0] : data[firstKey];
      const formattedKey = firstKey.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
      return `${formattedKey}: ${msg}`;
    }
  }
  return defaultMsg;
}

function UploadCard({
  title,
  description,
  icon: Icon,
  file,
  newPreview,
  existingUrl,
  onFileChange,
  accept,
  isSignature,
}) {
  const inputRef = useRef(null);
  const showImage = newPreview || existingUrl;
  const isNew = !!newPreview;

  return (
    <Card hover>
      <CardContent className="p-6 flex flex-col h-full">
        <div className="flex items-center justify-between mb-4">
          <div className="w-12 h-12 rounded-xl bg-electric/20 text-electric flex items-center justify-center">
            <Icon size={24} />
          </div>
          {existingUrl && !isNew && <Badge variant="success">Uploaded</Badge>}
          {isNew && <Badge variant="warning">Pending</Badge>}
        </div>
        <h3 className="font-heading text-white mb-1">{title}</h3>
        <p className="text-sm text-elite-text-muted mb-4 flex-1">{description}</p>

        {showImage ? (
          <div className="w-full h-28 rounded-xl border border-elite-border overflow-hidden bg-elite-surface mb-4">
            <img
              src={showImage}
              alt=""
              className={`w-full h-full ${isSignature ? 'object-contain' : 'object-cover'}`}
            />
          </div>
        ) : (
          <div className="w-full h-28 rounded-xl border border-dashed border-elite-border bg-elite-surface/50 flex items-center justify-center mb-4">
            <span className="text-sm text-elite-text-muted">No file</span>
          </div>
        )}

        <input
          ref={inputRef}
          type="file"
          accept={accept}
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) onFileChange(f);
            e.target.value = '';
          }}
        />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="w-full"
          onClick={() => inputRef.current?.click()}
        >
          {file ? 'Change file' : 'Select file'}
        </Button>
      </CardContent>
    </Card>
  );
}

export default function ProfilePhotos() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [files, setFiles] = useState({ photo: null, id_photo: null, signature_photo: null });
  const [previews, setPreviews] = useState({ photo: null, id_photo: null, signature_photo: null });

  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    try {
      const response = await api.get('/profiles/my-profile/');
      const data = response.data.profile?.data || response.data.profile || response.data || response.data?.data;
      setUserProfile(data);
    } catch (err) {
      console.error('Failed to fetch profile', err);
    } finally {
      setFetching(false);
    }
  };

  const handleFileChange = (file, type) => {
    setFiles((prev) => ({ ...prev, [type]: file }));
    setPreviews((prev) => ({ ...prev, [type]: URL.createObjectURL(file) }));
  };

  const handleSubmit = async () => {
    if (!files.photo && !files.id_photo && !files.signature_photo) {
      setError('Please select at least one document to upload.');
      return;
    }
    setLoading(true);
    setError(null);
    const formData = new FormData();
    if (files.photo) formData.append('photo', files.photo);
    if (files.id_photo) formData.append('id_photo', files.id_photo);
    if (files.signature_photo) formData.append('signature_photo', files.signature_photo);
    try {
      await api.patch('/profiles/my-profile/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      window.location.reload();
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to upload documents.'));
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <PageTransition>
        <div className="flex items-center justify-center py-24">
          <div className="w-12 h-12 border-2 border-gold border-t-transparent rounded-full animate-spin" />
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="space-y-6">
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2 text-elite-text-muted hover:text-white transition-colors"
        >
          <ArrowLeft size={20} /> Back to Dashboard
        </button>

        <div>
          <h1 className="text-2xl font-display font-heading text-white">Account verification</h1>
          <p className="text-elite-text-muted text-sm mt-0.5">Upload the required documents to verify your identity.</p>
        </div>

        {error && (
          <div className="p-4 rounded-2xl border border-danger/30 bg-danger/10 text-danger text-sm flex items-center gap-2">
            <X size={18} className="flex-shrink-0" />
            {error}
          </div>
        )}

        <div className="grid gap-6 md:grid-cols-3">
          <UploadCard
            title="Profile photo"
            description="A clear photo of your face."
            icon={Image}
            file={files.photo}
            newPreview={previews.photo}
            existingUrl={userProfile?.photo_url}
            onFileChange={(file) => handleFileChange(file, 'photo')}
            accept="image/png,image/jpeg"
          />
          <UploadCard
            title="ID document"
            description="Passport or National ID card."
            icon={IdCard}
            file={files.id_photo}
            newPreview={previews.id_photo}
            existingUrl={userProfile?.id_photo_url}
            onFileChange={(file) => handleFileChange(file, 'id_photo')}
            accept="image/png,image/jpeg,application/pdf"
          />
          <UploadCard
            title="Signature"
            description="Photo of your signature."
            icon={PenLine}
            file={files.signature_photo}
            newPreview={previews.signature_photo}
            existingUrl={userProfile?.signature_photo_url}
            onFileChange={(file) => handleFileChange(file, 'signature_photo')}
            accept="image/png,image/jpeg"
            isSignature
          />
        </div>

        <div className="flex justify-end">
          <Button
            variant="primary"
            size="lg"
            leftIcon={<Upload size={20} />}
            onClick={handleSubmit}
            loading={loading}
            disabled={!files.photo && !files.id_photo && !files.signature_photo}
          >
            Upload selected documents
          </Button>
        </div>
      </div>
    </PageTransition>
  );
}
