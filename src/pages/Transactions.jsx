import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FileDown, ArrowDownLeft, ArrowUpRight, Filter } from 'lucide-react';
import api from '../services/api';
import { Card, CardContent, CardHeader } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { PageTransition } from '../components/layout/PageTransition';
import { Skeleton } from '../components/ui/Skeleton';

function StatusBadge({ status }) {
  const v = status?.toLowerCase();
  if (v === 'completed') return <Badge variant="success">Completed</Badge>;
  if (v === 'pending') return <Badge variant="warning">Pending</Badge>;
  if (v === 'failed') return <Badge variant="danger">Failed</Badge>;
  return <Badge>{status}</Badge>;
}

export default function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const [filters, setFilters] = useState({ start_date: '', end_date: '', account_number: '' });
  const [showFilters, setShowFilters] = useState(false);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.start_date) params.append('start_date', filters.start_date);
      if (filters.end_date) params.append('end_date', filters.end_date);
      if (filters.account_number) params.append('account_number', filters.account_number);
      const response = await api.get(`/accounts/transactions/?${params.toString()}`);
      setTransactions(response.data.results || response.data || []);
      setError('');
    } catch (err) {
      setError('Failed to fetch transactions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const handleDownloadPdf = async () => {
    setDownloadingPdf(true);
    try {
      const res = await api.post('/accounts/transactions/pdf/', {
        start_date: filters.start_date || undefined,
        end_date: filters.end_date || undefined,
        account_number: filters.account_number || undefined,
      });
      alert(res.data.message || 'PDF will be sent to your email');
    } catch (err) {
      setError('Failed to generate PDF');
    } finally {
      setDownloadingPdf(false);
    }
  };

  const handleFilterChange = (e) => {
    setFilters((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  return (
    <PageTransition>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h1 className="text-2xl font-display font-heading text-white">Transaction history</h1>
          <div className="flex gap-3">
            <Button
              variant="ghost"
              size="md"
              leftIcon={<Filter size={18} />}
              onClick={() => setShowFilters((s) => !s)}
            >
              Filters
            </Button>
            <Button
              variant="primary"
              size="md"
              leftIcon={<FileDown size={18} />}
              onClick={handleDownloadPdf}
              loading={downloadingPdf}
            >
              Download statement
            </Button>
          </div>
        </div>

        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="glass-card rounded-2xl p-6"
          >
            <form
              onSubmit={(e) => { e.preventDefault(); fetchTransactions(); }}
              className="grid grid-cols-1 sm:grid-cols-3 gap-4"
            >
              <Input
                label="Start date"
                type="date"
                name="start_date"
                value={filters.start_date}
                onChange={handleFilterChange}
              />
              <Input
                label="End date"
                type="date"
                name="end_date"
                value={filters.end_date}
                onChange={handleFilterChange}
              />
              <Input
                label="Account number"
                name="account_number"
                value={filters.account_number}
                onChange={handleFilterChange}
                placeholder="Optional"
              />
              <div className="sm:col-span-3">
                <Button type="submit" variant="outline" size="md">Apply filters</Button>
              </div>
            </form>
          </motion.div>
        )}

        {error && (
          <div className="p-4 rounded-2xl border border-danger/30 bg-danger/10 text-danger text-sm">
            {error}
          </div>
        )}

        <Card>
          <CardContent className="p-0">
            {loading ? (
              <div className="p-8 space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : transactions.length === 0 ? (
              <div className="py-16 text-center text-elite-text-muted">
                No transactions found
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-elite-border text-left text-xs text-elite-text-muted uppercase">
                      <th className="py-4 px-6 font-medium">Type</th>
                      <th className="py-4 px-6 font-medium">Description</th>
                      <th className="py-4 px-6 font-medium">Status</th>
                      <th className="py-4 px-6 font-medium">Date</th>
                      <th className="py-4 px-6 font-medium text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map((tx) => (
                      <tr
                        key={tx.id}
                        className="border-b border-elite-border/50 hover:bg-white/[0.02] transition-colors"
                      >
                        <td className="py-4 px-6">
                          <span className="inline-flex items-center gap-1.5 font-medium capitalize">
                            {tx.transaction_type === 'deposit' ? (
                              <ArrowDownLeft size={16} className="text-emerald" />
                            ) : (
                              <ArrowUpRight size={16} className="text-danger" />
                            )}
                            {tx.transaction_type}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-elite-text-muted">{tx.description || '—'}</td>
                        <td className="py-4 px-6">
                          <StatusBadge status={tx.status} />
                        </td>
                        <td className="py-4 px-6 text-elite-text-muted text-sm">
                          {new Date(tx.created_at).toLocaleString()}
                        </td>
                        <td className="py-4 px-6 text-right font-heading">
                          <span className={tx.transaction_type === 'deposit' ? 'text-emerald' : 'text-danger'}>
                            {tx.transaction_type === 'withdrawal' ? '-' : '+'}${Number(tx.amount).toFixed(2)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </PageTransition>
  );
}
