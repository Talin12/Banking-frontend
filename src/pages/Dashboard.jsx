import { useEffect, useState, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Send,
  CreditCard,
  AlertCircle,
  User,
  Pencil,
  ChevronRight,
  ArrowUpRight,
  ArrowDownLeft,
} from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { useCountUp } from '../hooks/useCountUp';
import { Card, CardHeader, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { SkeletonBalance, SkeletonCard } from '../components/ui/Skeleton';
import { PageTransition } from '../components/layout/PageTransition';

const chartData = [
  { v: 40 }, { v: 60 }, { v: 55 }, { v: 80 }, { v: 70 }, { v: 90 }, { v: 85 }, { v: 95 }, { v: 88 }, { v: 100 },
];

function InfoRow({ label, value }) {
  return (
    <div>
      <p className="text-xs text-elite-text-muted uppercase tracking-wider mb-0.5">{label}</p>
      <p className="text-white font-medium">{value !== undefined && value !== null && value !== '' ? value : '—'}</p>
    </div>
  );
}

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [profile, setProfile] = useState(null);
  const [transactions, setTransactions] = useState([]);
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
      setError('Failed to load profile');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile, location.key]);

  useEffect(() => {
    let cancelled = false;
    api.get('/accounts/transactions/?page_size=5').then((res) => {
      if (!cancelled) setTransactions(res.data.results || res.data || []);
    }).catch(() => {});
    return () => { cancelled = true; };
  }, []);

  const balance = profile?.balance ?? profile?.account_balance ?? 0;
  const animatedBalance = useCountUp(balance, 1400, !loading);
  const hasNextOfKin = profile?.next_of_kin?.length > 0;
  const hasPhotos = profile?.photo_url && profile?.id_photo_url && profile?.signature_photo_url;

  if (loading) {
    return (
      <PageTransition>
        <div className="space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6">
            <SkeletonBalance />
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            <SkeletonCard />
            <SkeletonCard />
          </div>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="space-y-8">
        {/* Hero balance */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="rounded-3xl border border-elite-border bg-gradient-to-br from-elite-card to-elite-black p-8 lg:p-10 relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-metallic pointer-events-none" />
          <div className="absolute top-0 right-0 w-64 h-64 bg-gold/10 rounded-full blur-3xl" />
          <div className="relative">
            <p className="text-elite-text-muted text-sm uppercase tracking-wider mb-2">Available balance</p>
            <p className="text-balance-lg font-display font-heading bg-gradient-to-r from-white via-gray-200 to-gold bg-clip-text text-transparent">
              ${typeof animatedBalance === 'number' ? animatedBalance.toFixed(2) : balance}
            </p>
            <p className="text-elite-text-muted text-sm mt-1">{profile?.account_currency || 'USD'} • {profile?.account_number}</p>
            <div className="mt-6 h-12 w-48">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#D4AF37" stopOpacity={0.4} />
                      <stop offset="100%" stopColor="#D4AF37" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <Area type="monotone" dataKey="v" stroke="#D4AF37" strokeWidth={1.5} fill="url(#chartGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </motion.div>

        {/* Alerts */}
        <div className="flex flex-col gap-4">
          {!hasNextOfKin && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between gap-4 p-4 rounded-2xl border border-amber-500/30 bg-amber-500/10">
              <div className="flex items-center gap-3">
                <AlertCircle className="text-amber-400 flex-shrink-0" size={22} />
                <span className="text-sm text-white">Add a Next of Kin to activate your account.</span>
              </div>
              <Button size="sm" variant="outline" onClick={() => navigate('/next-of-kin')}>Add</Button>
            </motion.div>
          )}
          {hasNextOfKin && !hasPhotos && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between gap-4 p-4 rounded-2xl border border-electric/30 bg-electric/10">
              <div className="flex items-center gap-3">
                <AlertCircle className="text-electric flex-shrink-0" size={22} />
                <span className="text-sm text-white">Upload profile photo, ID and signature.</span>
              </div>
              <Button size="sm" variant="electric" onClick={() => navigate('/upload-photos')}>Upload</Button>
            </motion.div>
          )}
        </div>

        {/* Quick actions */}
        <div className="flex flex-wrap gap-4">
          <Button
            variant="primary"
            size="lg"
            leftIcon={<Send size={20} />}
            onClick={() => navigate('/operations')}
            className="shadow-glow-gold"
          >
            Transfer
          </Button>
          <Button
            variant="electric"
            size="lg"
            leftIcon={<CreditCard size={20} />}
            onClick={() => navigate('/virtual-cards')}
          >
            Virtual Cards
          </Button>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Welcome / Profile card */}
          <Card hover glow>
            <CardContent className="flex flex-row items-center justify-between gap-6">
              <div>
                <p className="text-gold text-xs uppercase tracking-wider font-medium mb-1">Welcome back</p>
                <h2 className="text-xl font-heading text-white">
                  {profile?.full_name || profile?.first_name || user?.first_name || 'User'}
                </h2>
                <p className="text-elite-text-muted text-sm mt-0.5">{user?.email}</p>
              </div>
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-gold/20 to-electric/20 border border-gold/30 flex items-center justify-center overflow-hidden">
                {profile?.photo_url ? (
                  <img src={profile.photo_url} alt="" className="w-full h-full object-cover" />
                ) : (
                  <User className="text-gold" size={32} />
                )}
              </div>
            </CardContent>
          </Card>

          {/* Profile overview */}
          <Card hover>
            <CardHeader className="flex flex-row items-center justify-between">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-heading text-white">Profile Overview</h3>
                <Badge variant={hasPhotos ? 'success' : 'warning'}>{hasPhotos ? 'Verified' : 'Incomplete'}</Badge>
              </div>
              <Button variant="ghost" size="sm" leftIcon={<Pencil size={14} />} onClick={() => navigate('/edit-profile')}>
                Edit
              </Button>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="grid grid-cols-2 gap-4">
                <InfoRow label="Full name" value={profile?.full_name} />
                <InfoRow label="Account number" value={profile?.account_number} />
                <InfoRow label="Email" value={profile?.email} />
                <InfoRow label="Phone" value={profile?.phone_number} />
                <InfoRow label="City / Country" value={`${profile?.city || '-'}, ${profile?.country || '-'}`} />
                <InfoRow label="Currency" value={profile?.account_currency} />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent transactions */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <h3 className="text-lg font-heading text-white">Recent transactions</h3>
            <button
              onClick={() => navigate('/transactions')}
              className="text-sm text-gold hover:text-gold-light flex items-center gap-1"
            >
              View all <ChevronRight size={16} />
            </button>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-elite-border text-left text-xs text-elite-text-muted uppercase">
                    <th className="py-4 px-6 font-medium">Type</th>
                    <th className="py-4 px-6 font-medium">Description</th>
                    <th className="py-4 px-6 font-medium">Date</th>
                    <th className="py-4 px-6 font-medium text-right">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-12 px-6 text-center text-elite-text-muted">
                        No recent transactions
                      </td>
                    </tr>
                  ) : (
                    transactions.map((tx) => (
                      <tr
                        key={tx.id}
                        className="border-b border-elite-border/50 hover:bg-white/[0.02] transition-colors cursor-pointer"
                        onClick={() => navigate('/transactions')}
                      >
                        <td className="py-4 px-6">
                          <span className="inline-flex items-center gap-1.5">
                            {tx.transaction_type === 'deposit' ? (
                              <ArrowDownLeft size={16} className="text-emerald" />
                            ) : (
                              <ArrowUpRight size={16} className="text-danger" />
                            )}
                            <span className="font-medium capitalize">{tx.transaction_type}</span>
                          </span>
                        </td>
                        <td className="py-4 px-6 text-elite-text-muted">{tx.description || '—'}</td>
                        <td className="py-4 px-6 text-elite-text-muted text-sm">
                          {new Date(tx.created_at).toLocaleDateString()}
                        </td>
                        <td className="py-4 px-6 text-right font-heading">
                          <span className={tx.transaction_type === 'deposit' ? 'text-emerald' : 'text-danger'}>
                            {tx.transaction_type === 'withdrawal' ? '-' : '+'}${Number(tx.amount).toFixed(2)}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {error && (
          <div className="p-4 rounded-2xl border border-danger/30 bg-danger/10 text-danger text-sm">
            {error}
          </div>
        )}
      </div>
    </PageTransition>
  );
}
