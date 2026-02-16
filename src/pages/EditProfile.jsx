import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, User, MapPin, IdCard, Briefcase, Save } from 'lucide-react';
import api from '../services/api';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardContent, CardHeader } from '../components/ui/Card';
import { PageTransition } from '../components/layout/PageTransition';

const initialValues = {
  title: '',
  first_name: '',
  middle_name: '',
  last_name: '',
  gender: '',
  date_of_birth: '',
  marital_status: '',
  phone_number: '',
  address: '',
  city: '',
  country: '',
  nationality: '',
  country_of_birth: '',
  place_of_birth: '',
  means_of_identification: '',
  passport_number: '',
  id_issue_date: '',
  id_expiry_date: '',
  employment_status: '',
  employer_name: '',
  employer_address: '',
  employer_city: '',
  employer_state: '',
  date_of_employment: '',
  annual_income: '',
  account_currency: '',
  account_type: '',
};

const tabs = [
  { id: 'personal', label: 'Personal', icon: User },
  { id: 'contact', label: 'Contact', icon: MapPin },
  { id: 'identity', label: 'Identity', icon: IdCard },
  { id: 'employment', label: 'Employment', icon: Briefcase },
];

function SelectField({ label, value, onChange, options, required }) {
  return (
    <div>
      {label && (
        <label className="block text-sm font-medium text-elite-text-muted mb-1.5">
          {label} {required && '*'}
        </label>
      )}
      <select
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        className="w-full px-4 py-3 rounded-xl bg-elite-surface border border-elite-border text-white focus:border-gold focus:ring-2 focus:ring-gold/20 focus:outline-none"
      >
        <option value="">Select...</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>
  );
}

export default function EditProfile() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('personal');
  const [form, setForm] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [error, setError] = useState(null);

  const setField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: null }));
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await api.get('/profiles/my-profile/');
      const data = response.data.profile?.data || response.data.profile || response.data || {};
      const sanitized = {};
      Object.keys(initialValues).forEach((key) => {
        sanitized[key] = data[key] == null ? '' : data[key];
      });
      setForm(sanitized);
    } catch (err) {
      console.error(err);
      setError('Could not load profile.');
    } finally {
      setFetchLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setErrors({});
    try {
      const payload = { ...form };
      ['date_of_birth', 'id_issue_date', 'id_expiry_date', 'date_of_employment'].forEach((key) => {
        if (payload[key] === '') payload[key] = null;
      });
      await api.patch('/profiles/my-profile/', payload);
      navigate('/dashboard');
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.detail || 'Failed to update profile.';
      setError(msg);
      const backend = err.response?.data;
      if (backend && typeof backend === 'object') {
        const formErrors = {};
        const extract = (v) => (Array.isArray(v) ? v[0] : v);
        if (backend.errors) {
          Object.keys(backend.errors).forEach((key) => {
            if (key in form) formErrors[key] = extract(backend.errors[key]);
          });
        } else {
          Object.keys(backend).forEach((key) => {
            if (key in form) formErrors[key] = extract(backend[key]);
          });
        }
        setErrors(formErrors);
      }
    } finally {
      setLoading(false);
    }
  };

  if (fetchLoading) {
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

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <h1 className="text-2xl font-display font-heading text-white">Edit profile</h1>
              <p className="text-elite-text-muted text-sm mt-0.5">Update your personal and account information.</p>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            {error && (
              <div className="mb-6 p-4 rounded-xl border border-danger/30 bg-danger/10 text-danger text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="flex border-b border-elite-border gap-1 mb-6 overflow-x-auto">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                      activeTab === tab.id
                        ? 'border-gold text-gold'
                        : 'border-transparent text-elite-text-muted hover:text-white'
                    }`}
                  >
                    <tab.icon size={18} /> {tab.label}
                  </button>
                ))}
              </div>

              {activeTab === 'personal' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <SelectField
                    label="Title"
                    value={form.title}
                    onChange={(v) => setField('title', v)}
                    options={[
                      { value: 'mr', label: 'Mr' },
                      { value: 'mrs', label: 'Mrs' },
                      { value: 'miss', label: 'Miss' },
                    ]}
                  />
                  <SelectField
                    label="Gender"
                    value={form.gender}
                    onChange={(v) => setField('gender', v)}
                    options={[
                      { value: 'male', label: 'Male' },
                      { value: 'female', label: 'Female' },
                    ]}
                  />
                  <Input label="First name" value={form.first_name} onChange={(e) => setField('first_name', e.target.value)} error={errors.first_name} required />
                  <Input label="Middle name" value={form.middle_name} onChange={(e) => setField('middle_name', e.target.value)} />
                  <Input label="Last name" value={form.last_name} onChange={(e) => setField('last_name', e.target.value)} error={errors.last_name} required />
                  <Input label="Date of birth" type="date" value={form.date_of_birth} onChange={(e) => setField('date_of_birth', e.target.value)} />
                  <SelectField
                    label="Marital status"
                    value={form.marital_status}
                    onChange={(v) => setField('marital_status', v)}
                    options={[
                      { value: 'single', label: 'Single' },
                      { value: 'married', label: 'Married' },
                      { value: 'divorced', label: 'Divorced' },
                      { value: 'widowed', label: 'Widowed' },
                      { value: 'separated', label: 'Separated' },
                    ]}
                  />
                </div>
              )}

              {activeTab === 'contact' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input label="Phone number" value={form.phone_number} onChange={(e) => setField('phone_number', e.target.value)} error={errors.phone_number} placeholder="+123456789" required />
                  <Input label="City" value={form.city} onChange={(e) => setField('city', e.target.value)} />
                  <Input label="Country" value={form.country} onChange={(e) => setField('country', e.target.value)} />
                  <div className="sm:col-span-2">
                    <Input label="Address" value={form.address} onChange={(e) => setField('address', e.target.value)} />
                  </div>
                </div>
              )}

              {activeTab === 'identity' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input label="Nationality" value={form.nationality} onChange={(e) => setField('nationality', e.target.value)} />
                  <Input label="Country of birth" value={form.country_of_birth} onChange={(e) => setField('country_of_birth', e.target.value)} />
                  <Input label="Place of birth" value={form.place_of_birth} onChange={(e) => setField('place_of_birth', e.target.value)} />
                  <SelectField
                    label="Means of identification"
                    value={form.means_of_identification}
                    onChange={(v) => setField('means_of_identification', v)}
                    options={[
                      { value: 'passport', label: 'Passport' },
                      { value: 'national_id', label: 'National ID' },
                      { value: 'drivers_license', label: 'Drivers License' },
                    ]}
                  />
                  <Input label="ID / Passport number" value={form.passport_number} onChange={(e) => setField('passport_number', e.target.value)} />
                  <Input label="ID issue date" type="date" value={form.id_issue_date} onChange={(e) => setField('id_issue_date', e.target.value)} />
                  <Input label="ID expiry date" type="date" value={form.id_expiry_date} onChange={(e) => setField('id_expiry_date', e.target.value)} />
                </div>
              )}

              {activeTab === 'employment' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <SelectField
                    label="Employment status"
                    value={form.employment_status}
                    onChange={(v) => setField('employment_status', v)}
                    options={[
                      { value: 'employed', label: 'Employed' },
                      { value: 'self_employed', label: 'Self Employed' },
                      { value: 'unemployed', label: 'Unemployed' },
                      { value: 'student', label: 'Student' },
                      { value: 'retired', label: 'Retired' },
                    ]}
                  />
                  <Input label="Employer name" value={form.employer_name} onChange={(e) => setField('employer_name', e.target.value)} />
                  <Input label="Annual income" value={form.annual_income} onChange={(e) => setField('annual_income', e.target.value)} />
                  <Input label="Date of employment" type="date" value={form.date_of_employment} onChange={(e) => setField('date_of_employment', e.target.value)} />
                  <Input label="Employer city" value={form.employer_city} onChange={(e) => setField('employer_city', e.target.value)} />
                  <Input label="Employer state" value={form.employer_state} onChange={(e) => setField('employer_state', e.target.value)} />
                  <div className="sm:col-span-2">
                    <Input label="Employer address" value={form.employer_address} onChange={(e) => setField('employer_address', e.target.value)} />
                  </div>
                </div>
              )}

              <div className="flex flex-wrap gap-3 mt-8 pt-6 border-t border-elite-border">
                <Button type="button" variant="ghost" onClick={() => navigate('/dashboard')}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary" leftIcon={<Save size={18} />} loading={loading}>
                  Save changes
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </PageTransition>
  );
}
