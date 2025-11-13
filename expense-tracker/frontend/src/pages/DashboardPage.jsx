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
  const [budgetAlerts, setBudgetAlerts] = useState([]);
  const [nlpPreview, setNlpPreview] = useState(null);
  const [nlpPreviewMeta, setNlpPreviewMeta] = useState(null);
  const [nlpPreviewMessage, setNlpPreviewMessage] = useState('');
  const [nlpPendingText, setNlpPendingText] = useState('');
  const [queryInput, setQueryInput] = useState('');
  const [queryAnswer, setQueryAnswer] = useState('');
  const [querySummary, setQuerySummary] = useState(null);
  const [queryError, setQueryError] = useState('');
  const [queryLoading, setQueryLoading] = useState(false);

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

  const submitNlpTransaction = async ({ confirm = false } = {}) => {
    const textPayload = confirm ? nlpPendingText : nlpInput;
    if (!textPayload.trim()) return;
    setLoading(true);
    try {
      console.log('[Dashboard] Sending NLP text', textPayload, { confirm });
      const payload = { text: textPayload };
      if (confirm) {
        payload.confirm = true;
      }
      const { data } = await api.post('/transactions/nlp', payload);
      if (data?.requiresConfirmation) {
        setNlpPreview(data.parsed || null);
        setNlpPreviewMeta(data.meta || null);
        setNlpPreviewMessage(data.message || 'Xác nhận trước khi lưu giao dịch.');
        setNlpPendingText(textPayload);
        setError('');
        setBudgetAlerts([]);
        return;
      }
      setBudgetAlerts(data?.budgetAlerts || []);
      setNlpInput('');
      setNlpPreview(null);
      setNlpPreviewMeta(null);
      setNlpPreviewMessage('');
      setNlpPendingText('');
      await fetchDashboardData(false);
      setError('');
      console.log('[Dashboard] NLP transaction created');
    } catch (err) {
      console.error('[Dashboard] NLP creation failed', err);
      setError(err.response?.data?.message || 'Không thể phân tích câu lệnh.');
      setBudgetAlerts([]);
      setNlpPreview(null);
      setNlpPreviewMeta(null);
      setNlpPreviewMessage('');
      if (confirm) {
        setNlpPendingText('');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = () => submitNlpTransaction();
  const handleConfirmPreview = () => submitNlpTransaction({ confirm: true });
  const handleCancelPreview = () => {
    setNlpPreview(null);
    setNlpPreviewMeta(null);
    setNlpPreviewMessage('');
    setNlpPendingText('');
  };

  const formatCurrency = (value) =>
    Number(value || 0).toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });

  const handleAsk = async () => {
    if (!queryInput.trim()) return;
    setQueryLoading(true);
    setQueryError('');
    try {
      const { data } = await api.post('/nlp/ask', { text: queryInput });
      setQueryAnswer(data?.answer || '');
      setQuerySummary(data?.summary || null);
    } catch (err) {
      console.error('[Dashboard] NLP ask failed', err);
      setQueryError(err.response?.data?.message || 'Không thể trả lời câu hỏi.');
      setQueryAnswer('');
      setQuerySummary(null);
    } finally {
      setQueryLoading(false);
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

      {!!budgetAlerts.length && (
        <section className="alert-panel">
          {budgetAlerts.map((alert) => (
            <div
              key={alert.budgetId + alert.status}
              className={`alert-card ${alert.status === 'exceeded' ? 'is-danger' : 'is-warning'}`}
            >
              <div>
                <strong>{alert.category || 'Ngân sách'}</strong>
                <p>{alert.message || 'Ngân sách gần đạt giới hạn.'}</p>
              </div>
              <div className="alert-values">
                <span>
                  Đã dùng:{' '}
                  {Number(alert.spent || 0).toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}
                </span>
                <span>
                  Giới hạn:{' '}
                  {Number(alert.limit || 0).toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}
                </span>
              </div>
            </div>
          ))}
          <button className="button button--ghost alert-panel__close" type="button" onClick={() => setBudgetAlerts([])}>
            Đã hiểu
          </button>
        </section>
      )}

      <section className="card">
        <h2>Hỏi nhanh</h2>
        <textarea
          value={queryInput}
          onChange={(e) => setQueryInput(e.target.value)}
          placeholder="Ví dụ: tháng này tiêu bao nhiêu cho ăn uống?"
          rows={2}
        />
        <div className="card__actions">
          <button className="button button--ghost" type="button" onClick={handleAsk} disabled={queryLoading}>
            {queryLoading ? 'Đang trả lời...' : 'Hỏi NLP'}
          </button>
          {queryError && <span className="error-text">{queryError}</span>}
        </div>
        {queryAnswer && (
          <div className="query-result">
            <p>{queryAnswer}</p>
            {querySummary && (
              <div className="query-breakdown">
                <div>
                  <small>Thu nhập</small>
                  <strong>
                    {(querySummary.totalIncome || 0).toLocaleString('vi-VN', {
                      style: 'currency',
                      currency: 'VND',
                    })}
                  </strong>
                </div>
                <div>
                  <small>Chi tiêu</small>
                  <strong>
                    {(querySummary.totalExpense || 0).toLocaleString('vi-VN', {
                      style: 'currency',
                      currency: 'VND',
                    })}
                  </strong>
                </div>
                <div>
                  <small>Số dư</small>
                  <strong>
                    {(querySummary.balance || 0).toLocaleString('vi-VN', {
                      style: 'currency',
                      currency: 'VND',
                    })}
                  </strong>
                </div>
              </div>
            )}
          </div>
        )}
      </section>

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

      {nlpPreview && (
        <section className="card nlp-preview">
          <h3>Xác nhận giao dịch</h3>
          {nlpPreviewMessage && <p className="nlp-preview__message">{nlpPreviewMessage}</p>}
          <div className="nlp-preview__grid">
            <div>
              <small>Số tiền</small>
              <strong>{formatCurrency(nlpPreview.amount)}</strong>
            </div>
            <div>
              <small>Loại</small>
              <strong className="pill">{nlpPreview.type === 'income' ? 'Thu nhập' : 'Chi tiêu'}</strong>
            </div>
            <div>
              <small>Danh mục</small>
              <strong>{nlpPreview.category || 'Khác'}</strong>
            </div>
            <div>
              <small>Ngày giao dịch</small>
              <strong>{nlpPreview.date}</strong>
            </div>
            <div>
              <small>Mô tả</small>
              <strong>{nlpPreview.description || 'Không có'}</strong>
            </div>
          </div>
          <div className="nlp-preview__meta">
            <span>Độ tin cậy trung bình: {(nlpPreviewMeta?.avgConfidence ?? 0).toFixed(2)}</span>
          </div>
          <div className="card__actions">
            <button className="button" type="button" onClick={handleConfirmPreview} disabled={loading}>
              {loading ? 'Đang lưu...' : 'Lưu giao dịch'}
            </button>
            <button className="button button--ghost" type="button" onClick={handleCancelPreview} disabled={loading}>
              Chỉnh lại
            </button>
          </div>
        </section>
      )}

      <div className="dashboard__grid">
        <ChartSummary summary={summary} />
        <TransactionList data={transactions} />
      </div>
    </div>
  );
};

export default DashboardPage;
