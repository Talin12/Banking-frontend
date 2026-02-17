import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, CheckCircle, XCircle, User } from 'lucide-react';
import api from '../services/api';
import { Card, CardContent, CardHeader } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { PageTransition } from '../components/layout/PageTransition';

export default function StaffDashboard() {
  const { user, isAccountExecutive, isTeller, isStaff } = useAuth();
  const navigate = useNavigate();
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [verifying, setVerifying] = useState(null);

  useEffect(() => {
    if (!isStaff) { navigate('/dashboard'); return; }
    fetchPendingAccounts();
  }, [isStaff]);

  const fetchPendingAccounts = async () => {
    try {
      const res = await api.get('/accounts/pending-verification/');
      setAccounts(res.data?.results || res.data || []);
    } catch {
      setMessage({ text: 'Failed to load accounts.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (accountId, approve) => {
    setVerifying(accountId);
    try {
      await api.patch(`/accounts/verify/${accountId}/`, {
        kyc_submitted: true,
        kyc_verified: approve,
      });
      setMessage({ text: `Account ${approve ? 'approved' : 'rejected'} successfully.`, type: 'success' });
      fetchPendingAccounts();
    } catch (err) {
      setMessage({ text: err.response?.data?.error || 'Action failed.', type: 'error' });
    } finally {
      setVerifying(null);
    }
  };

  const messageStyles = {
    success: 'border-emerald/30 bg-emerald/10 text-emerald',
    error: 'border-danger/30 bg-danger/10 text-danger',
  };

  return (
    <PageTransition>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2 text-elite-text-muted hover:text-white transition-colors">
            <ArrowLeft size={20} /> Dashboard
          </button>
          <Badge variant="warning">{user?.role?.replace('_', ' ').toUpperCase()}</Badge>
        </div>

        <div>
          <h1 className="text-2xl font-heading text-white">Staff Dashboard</h1>
          <p className="text-elite-text-muted text-sm mt-0.5">Manage KYC verifications and account approvals.</p>
        </div>

        {message.text && (
          <div className={`p-4 rounded-2xl border ${messageStyles[message.type]}`}>{message.text}</div>
        )}

        {isAccountExecutive && (
          <Card>
            <CardHeader>
              <h3 className="text-lg font-heading text-white">Pending KYC Verifications</h3>
            </CardHeader>
            <CardContent className="p-0">
              {loading ? (
                <div className="flex justify-center py-12">
                  <div className="w-10 h-10 border-2 border-gold border-t-transparent rounded-full animate-spin" />
                </div>
              ) : accounts.length === 0 ? (
                <p className="text-center text-elite-text-muted py-12">No pending verifications.</p>
              ) : (
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-elite-border text-left text-xs text-elite-text-muted uppercase">
                      <th className="py-4 px-6">Account Holder</th>
                      <th className="py-4 px-6">Account Number</th>
                      <th className="py-4 px-6">Type</th>
                      <th className="py-4 px-6">Status</th>
                      <th className="py-4 px-6 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {accounts.map((acc) => (
                      <tr key={acc.id} className="border-b border-elite-border/50 hover:bg-white/[0.02]">
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gold/10 flex items-center justify-center">
                              <User size={16} className="text-gold" />
                            </div>
                            <span className="text-white font-medium">{acc.user_full_name || acc.user}</span>
                          </div>
                        </td>
                        <td className="py-4 px-6 text-elite-text-muted font-mono text-sm">{acc.account_number}</td>
                        <td className="py-4 px-6">
                          <Badge variant="info">{acc.account_type}</Badge>
                        </td>
                        <td className="py-4 px-6">
                          <Badge variant={acc.kyc_submitted ? 'warning' : 'default'}>
                            {acc.kyc_submitted ? 'KYC Submitted' : 'Pending'}
                          </Badge>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex justify-end gap-2">
                            <Button
                              size="sm"
                              variant="success"
                              leftIcon={<CheckCircle size={14} />}
                              loading={verifying === acc.id}
                              onClick={() => handleVerify(acc.id, true)}
                            >
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="danger"
                              leftIcon={<XCircle size={14} />}
                              loading={verifying === acc.id}
                              onClick={() => handleVerify(acc.id, false)}
                            >
                              Reject
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </CardContent>
          </Card>
        )}

        {isTeller && (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-elite-text-muted mb-4">As a Teller, use Money Operations to process deposits.</p>
              <Button variant="primary" onClick={() => navigate('/operations')}>Go to Money Operations</Button>
            </CardContent>
          </Card>
        )}
      </div>
    </PageTransition>
  );
}