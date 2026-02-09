import { useEffect, useState } from 'react';
import api from '../services/api';

const Transactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const [filters, setFilters] = useState({
    start_date: '',
    end_date: '',
    account_number: ''
  });

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.start_date) params.append('start_date', filters.start_date);
      if (filters.end_date) params.append('end_date', filters.end_date);
      if (filters.account_number) params.append('account_number', filters.account_number);

      const response = await api.get(`/accounts/transactions/?${params.toString()}`);
      setTransactions(response.data.results || response.data);
      setError('');
    } catch (err) {
      setError('Failed to fetch transactions');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPdf = async () => {
    setDownloadingPdf(true);
    try {
      const payload = {
        start_date: filters.start_date || undefined,
        end_date: filters.end_date || undefined,
        account_number: filters.account_number || undefined
      };

      const response = await api.post('/accounts/transactions/pdf/', payload);
      
      alert(response.data.message || 'PDF is being generated and will be sent to your email');
      setError('');
    } catch (err) {
      setError('Failed to generate PDF statement');
      console.error(err);
    } finally {
      setDownloadingPdf(false);
    }
  };

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleApplyFilters = (e) => {
    e.preventDefault();
    fetchTransactions();
  };

  const getTransactionTypeColor = (type) => {
    const colors = {
      deposit: '#10b981',
      withdrawal: '#ef4444',
      transfer: '#3b82f6',
      interest: '#8b5cf6'
    };
    return colors[type] || '#6b7280';
  };

  const getStatusBadge = (status) => {
    const styles = {
      completed: { background: '#d1fae5', color: '#065f46' },
      pending: { background: '#fef3c7', color: '#92400e' },
      failed: { background: '#fee2e2', color: '#991b1b' }
    };
    return styles[status] || styles.pending;
  };

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h1 style={{ margin: 0 }}>Transaction History</h1>
        <button
          onClick={handleDownloadPdf}
          disabled={downloadingPdf}
          style={{
            padding: '10px 20px',
            background: downloadingPdf ? '#9ca3af' : '#8b5cf6',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: downloadingPdf ? 'not-allowed' : 'pointer',
            fontSize: '16px',
            fontWeight: '500'
          }}
        >
          {downloadingPdf ? 'Generating...' : '📄 Download Statement'}
        </button>
      </div>

      {/* Filters */}
      <form onSubmit={handleApplyFilters} style={{ 
        background: 'white', 
        padding: '20px', 
        borderRadius: '8px', 
        marginBottom: '30px',
        border: '1px solid #ddd'
      }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', marginBottom: '15px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', fontWeight: '500' }}>Start Date</label>
            <input
              type="date"
              name="start_date"
              value={filters.start_date}
              onChange={handleFilterChange}
              style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', fontWeight: '500' }}>End Date</label>
            <input
              type="date"
              name="end_date"
              value={filters.end_date}
              onChange={handleFilterChange}
              style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', fontWeight: '500' }}>Account Number</label>
            <input
              type="text"
              name="account_number"
              value={filters.account_number}
              onChange={handleFilterChange}
              placeholder="Optional"
              style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
            />
          </div>
        </div>
        <button type="submit" style={{ 
          padding: '10px 20px', 
          background: '#3b82f6', 
          color: 'white', 
          border: 'none', 
          borderRadius: '4px', 
          cursor: 'pointer' 
        }}>
          Apply Filters
        </button>
      </form>

      {/* Error */}
      {error && (
        <div style={{ background: '#fee2e2', color: '#991b1b', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
          {error}
        </div>
      )}

      {/* Loading */}
      {loading ? (
        <p>Loading transactions...</p>
      ) : transactions.length === 0 ? (
        <div style={{ background: 'white', padding: '40px', textAlign: 'center', borderRadius: '8px', border: '1px solid #ddd' }}>
          <p style={{ fontSize: '18px', color: '#666' }}>No transactions found</p>
        </div>
      ) : (
        /* Transactions List */
        <div style={{ background: 'white', borderRadius: '8px', border: '1px solid #ddd', overflow: 'hidden' }}>
          {transactions.map((transaction) => (
            <div 
              key={transaction.id} 
              style={{ 
                padding: '20px', 
                borderBottom: '1px solid #eee',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                  <span style={{ 
                    fontSize: '18px', 
                    fontWeight: '600',
                    color: getTransactionTypeColor(transaction.transaction_type)
                  }}>
                    {transaction.transaction_type?.toUpperCase()}
                  </span>
                  <span style={{ 
                    padding: '4px 12px', 
                    borderRadius: '12px', 
                    fontSize: '12px',
                    fontWeight: '500',
                    ...getStatusBadge(transaction.status)
                  }}>
                    {transaction.status}
                  </span>
                </div>
                <p style={{ margin: '0 0 5px 0', color: '#666' }}>{transaction.description || 'No description'}</p>
                <p style={{ margin: 0, fontSize: '14px', color: '#999' }}>
                  {new Date(transaction.created_at).toLocaleString()}
                </p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ 
                  fontSize: '24px', 
                  fontWeight: '700',
                  color: transaction.transaction_type === 'deposit' ? '#10b981' : 
                         transaction.transaction_type === 'withdrawal' ? '#ef4444' : '#3b82f6'
                }}>
                  {transaction.transaction_type === 'withdrawal' ? '-' : '+'}${Number(transaction.amount).toFixed(2)}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Transactions;