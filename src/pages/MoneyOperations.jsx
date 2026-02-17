import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowDownToLine, ArrowUpFromLine, ArrowRightLeft } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardContent } from '../components/ui/Card';
import { OtpInput } from '../components/ui/OtpInput';
import { PageTransition } from '../components/layout/PageTransition';

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

export default function MoneyOperations() {
  const navigate = useNavigate();
  const { isTeller } = useAuth();

  const tabs = [
    ...(isTeller ? [{ id: 'deposit', label: 'Deposit', icon: ArrowDownToLine }] : []),
    { id: 'withdraw', label: 'Withdraw', icon: ArrowUpFromLine },
    { id: 'transfer', label: 'Transfer', icon: ArrowRightLeft },
  ];

  const [activeTab, setActiveTab] = useState(isTeller ? 'deposit' : 'withdraw');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [accountNumber, setAccountNumber] = useState('');

  const [depositAmount, setDepositAmount] = useState('');
  const [withdrawStep, setWithdrawStep] = useState(1);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawUsername, setWithdrawUsername] = useState('');
  const [transferStep, setTransferStep] = useState(1);
  const [recipientAccount, setRecipientAccount] = useState('');
  const [transferAmount, setTransferAmount] = useState('');
  const [transferDesc, setTransferDesc] = useState('');
  const [securityAnswer, setSecurityAnswer] = useState('');
  const [otp, setOtp] = useState('');

  useEffect(() => {
    api.get('/profiles/my-profile/').then((res) => {
      const p = res.data.profile?.data || res.data.profile || res.data;
      if (p?.account_number) setAccountNumber(p.account_number);
    }).catch(() => {});
  }, []);

  const clearMessage = () => setMessage({ text: '', type: '' });

  const handleDeposit = async (e) => {
    e.preventDefault();
    setLoading(true); clearMessage();
    try {
      await api.post('/accounts/deposit/', { account_number: accountNumber, amount: depositAmount });
      setMessage({ text: 'Deposit successful', type: 'success' });
      setDepositAmount('');
    } catch (err) {
      setMessage({ text: err.response?.status === 403 ? 'Permission denied: Bank Teller only.' : getErrorMessage(err, 'Deposit failed.'), type: 'error' });
    } finally { setLoading(false); }
  };

  const handleWithdrawInitiate = async (e) => {
    e.preventDefault();
    setLoading(true); clearMessage();
    try {
      await api.post('/accounts/initiate-withdrawal/', { account_number: accountNumber, amount: withdrawAmount });
      setWithdrawStep(2);
      setMessage({ text: 'Verify your username to confirm.', type: 'info' });
    } catch (err) {
      setMessage({ text: getErrorMessage(err, 'Withdrawal failed.'), type: 'error' });
    } finally { setLoading(false); }
  };

  const handleWithdrawConfirm = async (e) => {
    e.preventDefault();
    setLoading(true); clearMessage();
    try {
      await api.post('/accounts/verify-username-and-withdraw/', { username: withdrawUsername });
      setMessage({ text: 'Withdrawal successful', type: 'success' });
      setWithdrawStep(1); setWithdrawAmount(''); setWithdrawUsername('');
    } catch (err) {
      setMessage({ text: getErrorMessage(err, 'Verification failed.'), type: 'error' });
    } finally { setLoading(false); }
  };

  const handleTransferInitiate = async (e) => {
    e.preventDefault();
    setLoading(true); clearMessage();
    try {
      await api.post('/accounts/transfer/initiate/', {
        sender_account: accountNumber,
        receiver_account: recipientAccount,
        amount: transferAmount,
        description: transferDesc,
      });
      setTransferStep(2);
      setMessage({ text: 'Answer your security question.', type: 'info' });
    } catch (err) {
      setMessage({ text: getErrorMessage(err, 'Transfer failed.'), type: 'error' });
    } finally { setLoading(false); }
  };

  const handleTransferSecurity = async (e) => {
    e.preventDefault();
    setLoading(true); clearMessage();
    try {
      await api.post('/accounts/transfer/verify-security-question/', { security_answer: securityAnswer });
      setTransferStep(3);
      setMessage({ text: 'OTP sent to your email.', type: 'info' });
    } catch (err) {
      setMessage({ text: getErrorMessage(err, 'Incorrect answer.'), type: 'error' });
    } finally { setLoading(false); }
  };

  const handleTransferOTP = async (e) => {
    e.preventDefault();
    setLoading(true); clearMessage();
    try {
      await api.post('/accounts/transfer/verify-otp/', { otp });
      setMessage({ text: 'Transfer complete!', type: 'success' });
      setTransferStep(1);
      setRecipientAccount(''); setTransferAmount(''); setTransferDesc(''); setSecurityAnswer(''); setOtp('');
    } catch (err) {
      setMessage({ text: getErrorMessage(err, 'Invalid OTP.'), type: 'error' });
    } finally { setLoading(false); }
  };

  const messageStyles = {
    success: 'border-emerald/30 bg-emerald/10 text-emerald',
    error: 'border-danger/30 bg-danger/10 text-danger',
    info: 'border-electric/30 bg-electric/10 text-electric',
  };

  return (
    <PageTransition>
      <div className="max-w-2xl mx-auto space-y-6">
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2 text-elite-text-muted hover:text-white transition-colors"
        >
          <ArrowLeft size={20} /> Back to Dashboard
        </button>

        <Card>
          <div className="flex border-b border-elite-border">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  clearMessage();
                  setWithdrawStep(1);
                  setTransferStep(1);
                }}
                className={`flex-1 flex items-center justify-center gap-2 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-gold text-gold'
                    : 'border-transparent text-elite-text-muted hover:text-white'
                }`}
              >
                <tab.icon size={18} /> {tab.label}
              </button>
            ))}
          </div>

          <CardContent className="p-6 lg:p-8">
            {message.text && (
              <div className={`mb-6 p-4 rounded-xl border ${messageStyles[message.type] || messageStyles.info}`}>
                {message.text}
              </div>
            )}

            <AnimatePresence mode="wait">
              {activeTab === 'deposit' && isTeller && (
                <motion.form
                  key="deposit"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  onSubmit={handleDeposit}
                  className="space-y-5"
                >
                  <Input label="Account number to deposit into" value={accountNumber} onChange={(e) => setAccountNumber(e.target.value)} required />
                  <div>
                    <label className="block text-sm font-medium text-elite-text-muted mb-1.5">Amount ($)</label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={depositAmount}
                      onChange={(e) => setDepositAmount(e.target.value)}
                      placeholder="0.00"
                      className="w-full px-4 py-4 rounded-xl bg-elite-surface border border-elite-border text-2xl font-heading text-white placeholder-elite-text-muted focus:border-gold focus:ring-2 focus:ring-gold/20"
                    />
                  </div>
                  <Button type="submit" variant="success" size="lg" className="w-full" loading={loading}>
                    Deposit funds
                  </Button>
                </motion.form>
              )}

              {activeTab === 'withdraw' && (
                <motion.div
                  key="withdraw"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="space-y-5"
                >
                  <div className="flex items-center gap-2 mb-4">
                    {[1, 2].map((s) => (
                      <span key={s} className={`h-1 flex-1 rounded-full ${withdrawStep >= s ? 'bg-gold' : 'bg-elite-border'}`} />
                    ))}
                    <span className="text-sm text-elite-text-muted">Step {withdrawStep}/2</span>
                  </div>
                  {withdrawStep === 1 ? (
                    <form onSubmit={handleWithdrawInitiate} className="space-y-5">
                      <Input label="From account" value={accountNumber} readOnly />
                      <div>
                        <label className="block text-sm font-medium text-elite-text-muted mb-1.5">Amount ($)</label>
                        <input
                          type="number"
                          required
                          min="1"
                          value={withdrawAmount}
                          onChange={(e) => setWithdrawAmount(e.target.value)}
                          className="w-full px-4 py-4 rounded-xl bg-elite-surface border border-elite-border text-2xl font-heading text-white focus:border-gold focus:ring-2 focus:ring-gold/20"
                        />
                      </div>
                      <Button type="submit" variant="danger" size="lg" className="w-full" loading={loading}>
                        Next: Verify identity
                      </Button>
                    </form>
                  ) : (
                    <form onSubmit={handleWithdrawConfirm} className="space-y-5">
                      <Input
                        label="Confirm username"
                        value={withdrawUsername}
                        onChange={(e) => setWithdrawUsername(e.target.value)}
                        placeholder="Your username"
                        required
                      />
                      <div className="flex gap-3">
                        <Button type="button" variant="ghost" className="flex-1" onClick={() => setWithdrawStep(1)}>Back</Button>
                        <Button type="submit" variant="danger" className="flex-1" loading={loading}>Confirm withdraw</Button>
                      </div>
                    </form>
                  )}
                </motion.div>
              )}

              {activeTab === 'transfer' && (
                <motion.div
                  key="transfer"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="space-y-5"
                >
                  <div className="flex items-center gap-2 mb-4">
                    {[1, 2, 3].map((s) => (
                      <span key={s} className={`h-1 flex-1 rounded-full ${transferStep >= s ? 'bg-gold' : 'bg-elite-border'}`} />
                    ))}
                    <span className="text-sm text-elite-text-muted">Step {transferStep}/3</span>
                  </div>
                  {transferStep === 1 && (
                    <form onSubmit={handleTransferInitiate} className="space-y-5">
                      <Input label="From account" value={accountNumber} readOnly />
                      <Input label="Recipient account" value={recipientAccount} onChange={(e) => setRecipientAccount(e.target.value)} required />
                      <div>
                        <label className="block text-sm font-medium text-elite-text-muted mb-1.5">Amount ($)</label>
                        <input
                          type="number"
                          required
                          min="1"
                          value={transferAmount}
                          onChange={(e) => setTransferAmount(e.target.value)}
                          className="w-full px-4 py-4 rounded-xl bg-elite-surface border border-elite-border text-2xl font-heading text-white focus:border-gold focus:ring-2 focus:ring-gold/20"
                        />
                      </div>
                      <Input label="Description (optional)" value={transferDesc} onChange={(e) => setTransferDesc(e.target.value)} placeholder="e.g. Rent" />
                      <Button type="submit" variant="electric" size="lg" className="w-full" loading={loading}>Next</Button>
                    </form>
                  )}
                  {transferStep === 2 && (
                    <form onSubmit={handleTransferSecurity} className="space-y-5">
                      <p className="text-sm text-elite-text-muted">Answer your security question to proceed.</p>
                      <Input
                        label="Security answer"
                        type="password"
                        value={securityAnswer}
                        onChange={(e) => setSecurityAnswer(e.target.value)}
                        required
                      />
                      <div className="flex gap-3">
                        <Button type="button" variant="ghost" className="flex-1" onClick={() => setTransferStep(1)}>Back</Button>
                        <Button type="submit" variant="electric" className="flex-1" loading={loading}>Next: Verify OTP</Button>
                      </div>
                    </form>
                  )}
                  {transferStep === 3 && (
                    <form onSubmit={handleTransferOTP} className="space-y-5">
                      <div>
                        <label className="block text-sm font-medium text-elite-text-muted mb-3 text-center">Enter OTP from email</label>
                        <OtpInput value={otp} onChange={setOtp} length={6} disabled={loading} />
                      </div>
                      <div className="flex gap-3">
                        <Button type="button" variant="ghost" className="flex-1" onClick={() => setTransferStep(2)}>Back</Button>
                        <Button type="submit" variant="success" className="flex-1" loading={loading} disabled={otp.length !== 6}>
                          Complete transfer
                        </Button>
                      </div>
                    </form>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>
      </div>
    </PageTransition>
  );
}