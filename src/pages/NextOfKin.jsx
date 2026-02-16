import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Plus, Pencil, Trash2, Phone, Mail, MapPin, Users } from 'lucide-react';
import api from '../services/api';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { PageTransition } from '../components/layout/PageTransition';

const initialForm = {
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
};

export default function NextOfKin() {
  const navigate = useNavigate();
  const [list, setList] = useState([]);
  const [listLoading, setListLoading] = useState(true);
  const [error, setError] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [formErrors, setFormErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const setField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setFormErrors((prev) => ({ ...prev, [key]: null }));
  };

  const fetchNextOfKin = async () => {
    setListLoading(true);
    try {
      const response = await api.get('/profiles/my-profile/next-of-kin/');
      let data = response.data;
      if (data?.next_of_kin) data = data.next_of_kin;
      const items = data?.results || (Array.isArray(data) ? data : []);
      setList(items);
      setError(null);
    } catch (err) {
      console.error(err);
      setError('Failed to load contacts.');
    } finally {
      setListLoading(false);
    }
  };

  useEffect(() => {
    fetchNextOfKin();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setFormErrors({});
    try {
      if (editingId) {
        await api.put(`/profiles/my-profile/next-of-kin/${editingId}/`, form);
      } else {
        await api.post('/profiles/my-profile/next-of-kin/', form);
      }
      await fetchNextOfKin();
      closeDrawer();
    } catch (err) {
      const backend = err.response?.data;
      if (backend && typeof backend === 'object') {
        const fieldErrors = {};
        Object.keys(backend).forEach((key) => {
          if (key in form) {
            fieldErrors[key] = Array.isArray(backend[key]) ? backend[key][0] : backend[key];
          }
        });
        setFormErrors(fieldErrors);
        if (backend.detail) setError(backend.detail);
        else if (Object.keys(fieldErrors).length === 0) setError('Failed to save.');
      } else {
        setError('An unexpected error occurred.');
      }
    } finally {
      setLoading(false);
    }
  };

  const openDrawer = (kin = null) => {
    if (kin) {
      setEditingId(kin.id);
      setForm({
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
    } else {
      setEditingId(null);
      setForm(initialForm);
    }
    setError(null);
    setFormErrors({});
    setDrawerOpen(true);
  };

  const closeDrawer = () => {
    setDrawerOpen(false);
    setEditingId(null);
    setForm(initialForm);
    setFormErrors({});
    setError(null);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this contact?')) return;
    try {
      await api.delete(`/profiles/my-profile/next-of-kin/${id}/`);
      fetchNextOfKin();
    } catch (err) {
      setError('Failed to delete contact.');
    }
  };

  const titleOptions = ['Mr', 'Mrs', 'Miss', 'Ms', 'Dr', 'Prof'];
  const genderOptions = ['Male', 'Female', 'Other'];

  return (
    <PageTransition>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 text-elite-text-muted hover:text-white transition-colors"
          >
            <ArrowLeft size={20} /> Dashboard
          </button>
          <Button variant="primary" leftIcon={<Plus size={18} />} onClick={() => openDrawer()}>
            Add contact
          </Button>
        </div>

        <div>
          <h1 className="text-2xl font-display font-heading text-white">Next of kin</h1>
          <p className="text-elite-text-muted text-sm mt-0.5">Manage emergency contacts and beneficiaries.</p>
        </div>

        {error && !drawerOpen && (
          <div className="p-4 rounded-2xl border border-danger/30 bg-danger/10 text-danger text-sm">
            {error}
          </div>
        )}

        {listLoading ? (
          <div className="flex items-center justify-center py-24">
            <div className="w-12 h-12 border-2 border-gold border-t-transparent rounded-full animate-spin" />
          </div>
        ) : list.length === 0 ? (
          <Card>
            <CardContent className="py-16 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gold/10 text-gold mb-4">
                <Users size={32} />
              </div>
              <p className="text-elite-text-muted mb-6">No contacts added yet.</p>
              <Button variant="primary" onClick={() => openDrawer()}>
                Add your first contact
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {list.map((kin) => (
              <Card key={kin.id} hover>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between gap-2 mb-4">
                    <Badge variant="info">{kin.relationship}</Badge>
                    <div className="flex gap-1">
                      <button
                        onClick={() => openDrawer(kin)}
                        className="p-2 rounded-lg text-elite-text-muted hover:text-gold hover:bg-white/5 transition-colors"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(kin.id)}
                        className="p-2 rounded-lg text-elite-text-muted hover:text-danger hover:bg-danger/10 transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                  <h3 className="text-lg font-heading text-white">
                    {kin.title} {kin.first_name} {kin.last_name}
                  </h3>
                  {kin.other_names && (
                    <p className="text-sm text-elite-text-muted mb-3">{kin.other_names}</p>
                  )}
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-elite-text-muted">
                      <Phone size={14} className="flex-shrink-0" />
                      <span>{kin.phone_number}</span>
                    </div>
                    <div className="flex items-center gap-2 text-elite-text-muted">
                      <Mail size={14} className="flex-shrink-0" />
                      <span className="break-all">{kin.email_address}</span>
                    </div>
                    {(kin.address || kin.city || kin.country) && (
                      <div className="flex items-start gap-2 text-elite-text-muted">
                        <MapPin size={14} className="flex-shrink-0 mt-0.5" />
                        <span>{[kin.address, kin.city, kin.country].filter(Boolean).join(', ')}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Drawer */}
        <AnimatePresence>
          {drawerOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
                onClick={closeDrawer}
              />
              <motion.div
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'tween', duration: 0.25 }}
                className="fixed top-0 right-0 bottom-0 w-full max-w-md bg-elite-bg border-l border-elite-border z-50 flex flex-col shadow-2xl"
              >
                <div className="p-6 border-b border-elite-border flex items-center justify-between">
                  <h2 className="text-xl font-heading text-white">
                    {editingId ? 'Edit contact' : 'New contact'}
                  </h2>
                  <button
                    onClick={closeDrawer}
                    className="p-2 rounded-xl text-elite-text-muted hover:text-white hover:bg-white/5"
                  >
                    ✕
                  </button>
                </div>
                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
                  {error && (
                    <div className="p-4 rounded-xl border border-danger/30 bg-danger/10 text-danger text-sm">
                      {error}
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-elite-text-muted mb-1.5">Title</label>
                      <select
                        value={form.title}
                        onChange={(e) => setField('title', e.target.value)}
                        className="w-full px-4 py-3 rounded-xl bg-elite-surface border border-elite-border text-white focus:border-gold focus:ring-2 focus:ring-gold/20 focus:outline-none"
                      >
                        <option value="">Select</option>
                        {titleOptions.map((o) => (
                          <option key={o} value={o}>{o}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-elite-text-muted mb-1.5">Gender</label>
                      <select
                        value={form.gender}
                        onChange={(e) => setField('gender', e.target.value)}
                        className="w-full px-4 py-3 rounded-xl bg-elite-surface border border-elite-border text-white focus:border-gold focus:ring-2 focus:ring-gold/20 focus:outline-none"
                      >
                        <option value="">Select</option>
                        {genderOptions.map((o) => (
                          <option key={o} value={o.toLowerCase()}>{o}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <Input label="First name" value={form.first_name} onChange={(e) => setField('first_name', e.target.value)} error={formErrors.first_name} required />
                  <Input label="Last name" value={form.last_name} onChange={(e) => setField('last_name', e.target.value)} error={formErrors.last_name} required />
                  <Input label="Other names" value={form.other_names} onChange={(e) => setField('other_names', e.target.value)} />
                  <Input label="Relationship" value={form.relationship} onChange={(e) => setField('relationship', e.target.value)} error={formErrors.relationship} placeholder="e.g. Spouse" required />
                  <Input label="Date of birth" type="date" value={form.date_of_birth} onChange={(e) => setField('date_of_birth', e.target.value)} />
                  <Input label="Phone number" value={form.phone_number} onChange={(e) => setField('phone_number', e.target.value)} error={formErrors.phone_number} required />
                  <Input label="Email address" type="email" value={form.email_address} onChange={(e) => setField('email_address', e.target.value)} error={formErrors.email_address} required />
                  <Input label="Address" value={form.address} onChange={(e) => setField('address', e.target.value)} />
                  <div className="grid grid-cols-2 gap-4">
                    <Input label="City" value={form.city} onChange={(e) => setField('city', e.target.value)} />
                    <Input label="Country" value={form.country} onChange={(e) => setField('country', e.target.value)} />
                  </div>
                  <Button type="submit" variant="primary" size="lg" className="w-full mt-6" loading={loading}>
                    {editingId ? 'Save changes' : 'Create contact'}
                  </Button>
                </form>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </PageTransition>
  );
}
