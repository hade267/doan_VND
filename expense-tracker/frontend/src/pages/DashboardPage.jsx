import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import TransactionList from '../components/TransactionList';
import ChartSummary from '../components/ChartSummary';
import { TrendDownIcon, TrendUpIcon, WalletIcon } from '../components/icons';

const DashboardPage = () => {
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

  return (
    <div className="dashboard">
      <header className="dashboard__header">
        <div>
          <div className="pill">Money Lover Style</div>
          <h1>Chào mừng trở lại!</h1>
          <p>Nhập câu tự nhiên để MoneyWave ghi lại giao dịch giúp bạn.</p>
        </div>
      </header>

      <div className="quick-cards">
        <div className="quick-card">
          <small>Số dư khả dụng</small>
          <div className="icon-badge">
            <WalletIcon size={18} />
          </div>
          <strong>
            {(summary?.balance ?? 0).toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}
          </strong>
        </div>
        <div className="quick-card">
          <small>Thu nhập tháng</small>
          <div className="icon-badge">
            <TrendUpIcon size={18} />
          </div>
          <strong>
            {(summary?.totalIncome ?? 0).toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}
          </strong>
        </div>
        <div className="quick-card">
          <small>Chi tiêu tháng</small>
          <div className="icon-badge">
            <TrendDownIcon size={18} />
          </div>
          <strong>
            {(summary?.totalExpense ?? 0).toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}
          </strong>
        </div>
      </div>

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
