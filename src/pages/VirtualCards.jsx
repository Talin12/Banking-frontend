import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, Trash2, Sparkles } from 'lucide-react';
import api from '../services/api';
import { Button } from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { PageTransition } from '../components/layout/PageTransition';

function formatCardNumber(num) {
  return num ? num.replace(/(\d{4})/g, '$1 ').trim() : '**** **** **** ****';
}

function formatExpiry(dateString) {
  if (!dateString) return 'MM/YY';
  const d = new Date(dateString);
  return `${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getFullYear()).slice(-2)}`;
}

function getErrorMessage(err, defaultMsg) {
  if (err.response?.data) {
    const d = err.response.data;
    if (d.error) return d.error;
    if (d.detail) return d.detail;
    if (d.non_field_errors) return d.non_field_errors[0];
    const key = Object.keys(d)[0];
    if (key) {
      const msg = Array.isArray(d[key]) ? d[key][0] : d[key];
      const label = key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
      return `${label}: ${msg}`;
    }
  }
  return defaultMsg;
}

function VirtualCardItem({ card, onTopUp, onDelete }) {
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    setTilt({ x: (y - 0.5) * 8, y: (x - 0.5) * -8 });
  };

  const handleMouseLeave = () => setTilt({ x: 0, y: 0 });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="perspective-[1000px]"
    >
      <motion.div
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{
          transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
          transformStyle: 'preserve-3d',
        }}
        className="rounded-2xl overflow-hidden border border-elite-border bg-gradient-to-br from-elite-card via-elite-surface to-elite-black p-6 shadow-xl hover:shadow-glow-gold hover:border-gold/30 transition-all duration-300"
      >
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-metallic pointer-events-none" />
          <div className="absolute top-0 right-0 w-32 h-32 bg-gold/20 rounded-full blur-2xl" />
          <div className="relative flex justify-between items-start mb-8">
            <span className="text-gold font-display font-heading italic text-lg">NextGen Bank</span>
            <span className="px-3 py-1 rounded-full text-xs font-medium bg-white/10 text-white border border-white/20">
              {card.status?.toUpperCase() || 'ACTIVE'}
            </span>
          </div>
          <div className="relative text-xl lg:text-2xl font-mono tracking-widest text-white mb-6" style={{ letterSpacing: '0.2em' }}>
            {formatCardNumber(card.card_number)}
          </div>
          <div className="relative flex justify-between items-end">
            <div>
              <p className="text-[10px] uppercase text-white/60 tracking-wider">Expires</p>
              <p className="text-sm font-medium text-white">{formatExpiry(card.expiry_date)}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase text-white/60 tracking-wider">CVV</p>
              <p className="text-sm font-medium text-white">{card.cvv}</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] uppercase text-white/60 tracking-wider">Balance</p>
              <p className="text-lg font-heading text-gold">${card.balance ?? '0.00'}</p>
            </div>
          </div>
          <div className="mt-6 pt-4 border-t border-white/10 flex gap-3">
            <Button variant="ghost" size="sm" className="flex-1" onClick={() => onTopUp(card)}>
              Top up
            </Button>
            <Button variant="danger" size="sm" className="flex-1" onClick={() => onDelete(card.id)}>
              <Trash2 size={16} /> Delete
            </Button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function VirtualCards() {
  const navigate = useNavigate();
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [showTopUpModal, setShowTopUpModal] = useState(false);
  const [selectedCard, setSelectedCard] = useState(null);
  const [topUpAmount, setTopUpAmount] = useState('');
  const [topUpLoading, setTopUpLoading] = useState(false);

  const fetchData = async () => {
    try {
      const cardRes = await api.get('/cards/virtual-cards/');
      let list = [];
      const visa = cardRes.data.visa_card;
      if (visa?.results) list = visa.results;
      else if (Array.isArray(visa)) list = visa;
      else if (Array.isArray(cardRes.data)) list = cardRes.data;
      else if (cardRes.data?.results) list = cardRes.data.results;
      setCards(list);
      try {
        const profileRes = await api.get('/profiles/my-profile/');
        const p = profileRes.data.profile?.data || profileRes.data.profile || profileRes.data;
        if (p?.account_number) setAccountNumber(p.account_number);
      } catch (_) {}
      setError('');
    } catch (err) {
      if (err.response?.status === 401) setError('Session expired. Please login again.');
      else if (err.response?.status !== 404) setError(getErrorMessage(err, 'Failed to load cards.'));
      else setCards([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateCard = async (e) => {
    e.preventDefault();
    setCreateLoading(true);
    try {
      await api.post('/cards/virtual-cards/', { bank_account_number: accountNumber });
      setShowCreateModal(false);
      fetchData();
      alert('Virtual card created successfully.');
    } catch (err) {
      alert(getErrorMessage(err, 'Failed to create card.'));
    } finally {
      setCreateLoading(false);
    }
  };

  const handleTopUp = async (e) => {
    e.preventDefault();
    if (!selectedCard) return;
    setTopUpLoading(true);
    try {
      await api.put(`/cards/virtual-cards/${selectedCard.id}/top-up/`, { amount: topUpAmount });
      setShowTopUpModal(false);
      setTopUpAmount('');
      setSelectedCard(null);
      fetchData();
      alert('Card topped up successfully.');
    } catch (err) {
      alert(getErrorMessage(err, 'Top-up failed.'));
    } finally {
      setTopUpLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this virtual card?')) return;
    try {
      await api.delete(`/cards/virtual-cards/${id}/`);
      fetchData();
    } catch (err) {
      alert(getErrorMessage(err, 'Failed to delete.'));
    }
  };

  return (
    <PageTransition>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-display font-heading text-white">Virtual cards</h1>
            <p className="text-elite-text-muted text-sm mt-0.5">Manage and top up your cards</p>
          </div>
          <Button
            variant="primary"
            size="lg"
            leftIcon={<Plus size={20} />}
            onClick={() => setShowCreateModal(true)}
            disabled={cards.length >= 3}
          >
            {cards.length >= 3 ? 'Limit reached (max 3)' : 'Create new card'}
          </Button>
        </div>

        {error && (
          <div className="p-4 rounded-2xl border border-danger/30 bg-danger/10 text-danger text-sm">
            {error}
          </div>
        )}

        {loading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2].map((i) => (
              <div key={i} className="rounded-2xl border border-elite-border p-6 h-56 skeleton-shimmer" />
            ))}
          </div>
        ) : cards.length === 0 ? (
          <Card>
            <CardContent className="py-16 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gold/10 text-gold mb-4">
                <Sparkles size={32} />
              </div>
              <h3 className="text-xl font-heading text-white mb-2">No virtual cards yet</h3>
              <p className="text-elite-text-muted mb-6 max-w-sm mx-auto">Create a virtual card for secure online payments.</p>
              <Button variant="primary" leftIcon={<Plus size={18} />} onClick={() => setShowCreateModal(true)}>
                Create card
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {cards.map((card) => (
              <VirtualCardItem
                key={card.id}
                card={card}
                onTopUp={(c) => { setSelectedCard(c); setShowTopUpModal(true); }}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>

      {/* Create modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card rounded-3xl p-8 w-full max-w-md"
          >
            <h2 className="text-xl font-heading text-white mb-1">Create virtual card</h2>
            <p className="text-elite-text-muted text-sm mb-6">Linked to your main account</p>
            <form onSubmit={handleCreateCard} className="space-y-4">
              <Input
                label="Source account number"
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                placeholder="Account number"
                required
              />
              <div className="flex gap-3">
                <Button type="submit" variant="primary" className="flex-1" loading={createLoading}>Create card</Button>
                <Button type="button" variant="ghost" onClick={() => setShowCreateModal(false)}>Cancel</Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Top up modal */}
      {showTopUpModal && selectedCard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card rounded-3xl p-8 w-full max-w-md"
          >
            <h2 className="text-xl font-heading text-white mb-1">Top up card</h2>
            <p className="text-elite-text-muted text-sm mb-6">
              Add funds to card ending in <strong className="text-white">{selectedCard.card_number?.slice(-4)}</strong>
            </p>
            <form onSubmit={handleTopUp} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-elite-text-muted mb-1.5">Amount ($)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={topUpAmount}
                  onChange={(e) => setTopUpAmount(e.target.value)}
                  className="w-full px-4 py-4 rounded-xl bg-elite-surface border border-elite-border text-2xl font-heading text-white focus:border-gold focus:ring-2 focus:ring-gold/20"
                />
              </div>
              <div className="flex gap-3">
                <Button type="submit" variant="success" className="flex-1" loading={topUpLoading}>Top up now</Button>
                <Button type="button" variant="ghost" onClick={() => { setShowTopUpModal(false); setSelectedCard(null); }}>Cancel</Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </PageTransition>
  );
}
