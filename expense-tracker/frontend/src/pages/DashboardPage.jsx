import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import TransactionList from '../components/TransactionList';
import ChartSummary from '../components/ChartSummary';

const DashboardPage = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [nlpInput, setNlpInput] = useState('');
  const [transactions, setTransactions] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchDashboardData = async (withSpinner = true) => {
    if (withSpinner) setLoading(true);
    try {
      console.log('[Dashboard] Fetching transactions & summary');
      const [transactionsRes, summaryRes] = await Promise.all([
        api.get('/transactions', { params: { limit: 5 } }),
        api.get('/reports/summary'),
      ]);
      setTransactions(transactionsRes.data.transactions || []);
      setSummary(summaryRes.data || summaryRes);
      setError('');
      console.log('[Dashboard] Data loaded', {
        transactions: transactionsRes.data.transactions?.length,
        summary: summaryRes.data || summaryRes,
      });
    } catch (err) {
      console.error('[Dashboard] Failed to load data', err);
      setError(err.response?.data?.message || 'Không thể tải dữ liệu.');
    } finally {
      if (withSpinner) setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleSubmit = async () => {
    if (!nlpInput.trim()) return;
    setLoading(true);
    try {
      console.log('[Dashboard] Sending NLP text', nlpInput);
      await api.post('/transactions/nlp', { text: nlpInput });
      setNlpInput('');
      await fetchDashboardData(false);
      setError('');
      console.log('[Dashboard] NLP transaction created');
    } catch (err) {
      console.error('[Dashboard] NLP creation failed', err);
      setError(err.response?.data?.message || 'Không thể phân tích câu lệnh.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="dashboard">
      <header className="dashboard__header">
        <div>
          <h1>Expense Tracker</h1>
          <p>Nhập câu tự nhiên để ghi lại giao dịch của bạn.</p>
        </div>
        <button className="button button--ghost" onClick={handleLogout}>
          Đăng xuất
        </button>
      </header>

      <section className="card">
        <h2>Ghi chép nhanh</h2>
        <textarea
          value={nlpInput}
          onChange={(e) => setNlpInput(e.target.value)}
          placeholder="Ví dụ: hôm qua ăn sáng 25k ở quán cô Ba"
          rows={3}
        />
        <div className="card__actions">
          <button className="button" onClick={handleSubmit} disabled={loading}>
            {loading ? 'Đang xử lý...' : 'Ghi lại'}
          </button>
          {error && <span className="error-text">{error}</span>}
        </div>
      </section>

      <div className="dashboard__grid">
        <ChartSummary summary={summary} />
        <TransactionList data={transactions} />
      </div>
    </div>
  );
};

export default DashboardPage;
