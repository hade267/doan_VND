import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import TransactionList from '../components/TransactionList';
import ChartSummary from '../components/ChartSummary';
import MetricCard from '../components/MetricCard';
import { BrainIcon, ReceiptIcon, TrendDownIcon, TrendUpIcon, WalletIcon } from '../components/icons';

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
  const [nlpInputError, setNlpInputError] = useState('');
  const assistantRef = useRef(null);
  const nlpSectionRef = useRef(null);

  const scrollToSection = (ref) => {
    if (ref?.current) {
      ref.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const fetchDashboardData = async (withSpinner = true) => {
    if (withSpinner) setLoading(true);
    try {
      const [transactionsRes, summaryRes] = await Promise.all([
        api.get('/transactions', { params: { limit: 5 } }),
        api.get('/reports/summary'),
      ]);
      setTransactions(transactionsRes.data.transactions || []);
      setSummary(summaryRes.data || summaryRes);
      setError('');
    } catch (err) {
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
    if (!confirm) {
      const trimmed = textPayload.trim();
      if (!trimmed) {
        setNlpInputError('Vui lòng nhập câu mô tả giao dịch.');
        return;
      }
      if (trimmed.length < 6) {
        setNlpInputError('Câu lệnh nên dài tối thiểu 6 ký tự để NLP hiểu đúng.');
        return;
      }
      if (!looksLikeTransaction(trimmed)) {
        setNlpInputError('Vui lòng mô tả giao dịch có số tiền hoặc danh mục cụ thể.');
        return;
      }
      setNlpInputError('');
    } else if (!textPayload.trim()) {
      return;
    }
    setLoading(true);
    try {
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
      setNlpInputError('');
      setNlpPreview(null);
      setNlpPreviewMeta(null);
      setNlpPreviewMessage('');
      setNlpPendingText('');
      await fetchDashboardData(false);
      setError('');
    } catch (err) {
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

  const metricCardsData = [
    {
      key: 'income',
      title: 'Thu nhập',
      value: formatCurrency(summary?.totalIncome),
      hint: 'Tổng thu tháng này',
      icon: TrendUpIcon,
    },
    {
      key: 'expense',
      title: 'Chi tiêu',
      value: formatCurrency(summary?.totalExpense),
      hint: 'Chi tiêu đã ghi nhận',
      icon: TrendDownIcon,
    },
    {
      key: 'balance',
      title: 'Cân bằng',
      value: formatCurrency(summary?.balance),
      hint: 'Sau thu/chi',
      icon: WalletIcon,
    },
    {
      key: 'transactions',
      title: 'Giao dịch gần đây',
      value: `${transactions.length || 0} mục`,
      hint: '5 bản ghi mới nhất',
      icon: ReceiptIcon,
    },
  ];

  const renderMetricGrid = () => {
    if (!summary) {
      return Array.from({ length: 4 }).map((_, index) => (
        <div key={`metric-skeleton-${index}`} className="skeleton-card space-y-3">
          <div className="skeleton skeleton--text w-24" />
          <div className="skeleton skeleton--title w-32" />
          <div className="skeleton skeleton--text w-20" />
        </div>
      ));
    }

    return metricCardsData.map((metric) => <MetricCard key={metric.key} {...metric} />);
  };

  const quickStats = [
    { label: 'Giao dịch gần đây', value: transactions.length || 0 },
    { label: 'Cảnh báo ngân sách', value: budgetAlerts.length || 0 },
    { label: 'Hỏi đáp NLP', value: queryAnswer ? 'Đã trả lời' : 'Chưa có' },
  ];
  const hasAlerts = budgetAlerts.length > 0;

  const handleAsk = async () => {
    if (!queryInput.trim()) return;
    setQueryLoading(true);
    setQueryError('');
    try {
      const { data } = await api.post('/nlp/ask', { text: queryInput });
      setQueryAnswer(data?.answer || '');
      setQuerySummary(data?.summary || null);
    } catch (err) {
      setQueryError(err.response?.data?.message || 'Không thể trả lời câu hỏi.');
      setQueryAnswer('');
      setQuerySummary(null);
    } finally {
      setQueryLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="glass-panel glass-panel--gradient text-white shadow-2xl">
          <div className="flex flex-col gap-6">
            <div>
              <p className="pill bg-white/20 text-white/80">MoneyWave v2</p>
              <h1 className="mt-3 text-3xl font-semibold leading-tight sm:text-4xl">
                Điều phối tài chính với trải nghiệm đậm chất tương lai.
              </h1>
              <p className="mt-2 text-white/80">
                Dark mode nhất quán, dashboard modular và trợ lý NLP đa tầng giúp ghi nhanh, phân tích sâu và
                kiểm soát ngân sách mọi lúc.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                className="button bg-white text-brand hover:-translate-y-0.5"
                type="button"
                onClick={() => scrollToSection(nlpSectionRef)}
              >
                <ReceiptIcon size={16} />
                Ghi nhanh giao dịch
              </button>
              <button
                className="button--ghost border-white/60 text-white hover:border-white"
                type="button"
                onClick={() => scrollToSection(assistantRef)}
              >
                <BrainIcon size={16} />
                Hỏi NLP
              </button>
              <button
                className="button--ghost border-white/30 text-white hover:border-white/80"
                type="button"
                onClick={() => navigate('/transactions')}
              >
                <WalletIcon size={16} />
                Quản lý giao dịch
              </button>
            </div>
          </div>
        </div>
        <div className="glass-panel space-y-5">
          <div>
            <p className="eyebrow">Trạng thái</p>
            <h3 className="text-xl font-semibold">Nhịp độ tài chính</h3>
          </div>
          <ul className="space-y-3 text-sm text-slate-600 dark:text-slate-300">
            {quickStats.map((item) => (
              <li
                key={item.label}
                className="flex items-center justify-between rounded-2xl bg-slate-50/70 px-4 py-3 shadow-inner shadow-white/20 dark:bg-slate-900/50"
              >
                <span>{item.label}</span>
                <strong className="text-base text-slate-900 dark:text-white">{item.value}</strong>
              </li>
            ))}
          </ul>
          <div className="flex flex-wrap gap-3">
            <button className="button" type="button" onClick={() => fetchDashboardData()}>
              Làm mới dữ liệu
            </button>
            <button className="button--ghost" type="button" onClick={() => scrollToSection(nlpSectionRef)}>
              Ghi giao dịch
            </button>
            <button className="button--ghost" type="button" onClick={() => scrollToSection(assistantRef)}>
              Hỏi trợ lý
            </button>
          </div>
        </div>
      </section>

      <section className="metric-grid">{renderMetricGrid()}</section>

      {hasAlerts && (
        <section className="glass-panel space-y-4 border border-amber-200/70 bg-amber-50/70 dark:border-amber-500/30 dark:bg-amber-500/10">
          <div className="flex items-center justify-between">
            <div>
              <p className="eyebrow text-amber-500">Ngân sách</p>
              <h3 className="text-lg font-semibold text-amber-600 dark:text-amber-200">Cảnh báo chi tiêu</h3>
            </div>
            <button className="button--ghost" type="button" onClick={() => setBudgetAlerts([])}>
              Đã hiểu
            </button>
          </div>
          <div className="space-y-3">
            {budgetAlerts.map((alert) => (
              <div
                key={alert.budgetId + alert.status}
                className="rounded-2xl border border-amber-200/80 bg-white/70 p-4 shadow-sm shadow-amber-100 dark:border-amber-500/40 dark:bg-slate-900/60"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <strong className="text-amber-600 dark:text-amber-200">{alert.category || 'Ngân sách'}</strong>
                    <p className="text-sm text-slate-600 dark:text-slate-300">{alert.message}</p>
                  </div>
                  <span
                    className={`badge ${
                      alert.status === 'exceeded' ? 'badge--danger' : 'badge--success'
                    }`}
                  >
                    {alert.status === 'exceeded' ? 'Vượt hạn' : 'Sắp chạm hạn'}
                  </span>
                </div>
                <div className="mt-3 grid gap-3 text-sm text-slate-600 dark:text-slate-300 sm:grid-cols-2">
                  <p>Đã dùng: {formatCurrency(alert.spent)}</p>
                  <p>Giới hạn: {formatCurrency(alert.limit)}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="grid gap-6 lg:grid-cols-2">
        <div ref={assistantRef} className="glass-panel space-y-4">
          <div>
            <p className="eyebrow">Assistant</p>
            <h2 className="text-xl font-semibold">Hỏi nhanh</h2>
          </div>
          <textarea
            value={queryInput}
            onChange={(e) => setQueryInput(e.target.value)}
            placeholder="VD: Tháng này tiêu bao nhiêu cho ăn uống?"
            rows={3}
          />
          <div className="flex flex-wrap items-center gap-3">
            <button className="button--ghost" type="button" onClick={handleAsk} disabled={queryLoading}>
              {queryLoading ? 'Đang trả lời...' : 'Hỏi NLP'}
            </button>
            {queryError && <span className="error-text">{queryError}</span>}
          </div>
          {queryAnswer && (
            <div className="rounded-2xl border border-slate-100/80 bg-white/70 p-4 shadow-inner shadow-slate-200/60 dark:border-slate-800 dark:bg-slate-900/40">
              <p className="text-sm text-slate-600 dark:text-slate-200">{queryAnswer}</p>
              {querySummary && (
                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  <div>
                    <small className="text-slate-500 dark:text-slate-400">Thu nhập</small>
                    <p className="text-lg font-semibold text-brand">
                      {formatCurrency(querySummary.totalIncome)}
                    </p>
                  </div>
                  <div>
                    <small className="text-slate-500 dark:text-slate-400">Chi tiêu</small>
                    <p className="text-lg font-semibold text-rose-500">
                      {formatCurrency(querySummary.totalExpense)}
                    </p>
                  </div>
                  <div>
                    <small className="text-slate-500 dark:text-slate-400">Số dư</small>
                    <p className="text-lg font-semibold text-slate-900 dark:text-white">
                      {formatCurrency(querySummary.balance)}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
        <div ref={nlpSectionRef} className="glass-panel space-y-4">
          <div>
            <p className="eyebrow">Ghi nhanh</p>
            <h2 className="text-xl font-semibold">Nhập câu lệnh</h2>
          </div>
          <textarea
            value={nlpInput}
            onChange={(e) => {
              setNlpInput(e.target.value);
              if (nlpInputError) {
                setNlpInputError('');
              }
            }}
            placeholder='VD: "Ăn tối cùng team 320k"'
            rows={4}
          />
          <div className="flex flex-wrap items-center gap-3">
            <button className="button" onClick={handleSubmit} disabled={loading}>
              {loading ? 'Đang xử lý...' : 'Ghi lại'}
            </button>
            {error && <span className="error-text">{error}</span>}
            {nlpInputError && <span className="error-text">{nlpInputError}</span>}
          </div>
        </div>
      </section>

      {nlpPreview && (
        <section className="glass-panel space-y-4">
          <div>
            <p className="eyebrow">Xác nhận</p>
            <h3 className="text-xl font-semibold">Kiểm tra giao dịch</h3>
            {nlpPreviewMessage && <p className="text-sm text-slate-500">{nlpPreviewMessage}</p>}
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-2xl border border-slate-100/80 p-4 dark:border-slate-800">
              <small className="text-slate-500">Số tiền</small>
              <p className="text-xl font-semibold">{formatCurrency(nlpPreview.amount)}</p>
            </div>
            <div className="rounded-2xl border border-slate-100/80 p-4 dark:border-slate-800">
              <small className="text-slate-500">Loại</small>
              <p className="mt-1">
                <span className={nlpPreview.type === 'income' ? 'badge--income' : 'badge--expense'}>
                  {nlpPreview.type === 'income' ? 'Thu nhập' : 'Chi tiêu'}
                </span>
              </p>
            </div>
            <div className="rounded-2xl border border-slate-100/80 p-4 dark:border-slate-800">
              <small className="text-slate-500">Danh mục</small>
              <p className="text-lg font-semibold">{nlpPreview.category || 'Khác'}</p>
            </div>
            <div className="rounded-2xl border border-slate-100/80 p-4 dark:border-slate-800">
              <small className="text-slate-500">Ngày giao dịch</small>
              <p>{nlpPreview.date}</p>
            </div>
            <div className="rounded-2xl border border-slate-100/80 p-4 dark:border-slate-800">
              <small className="text-slate-500">Mô tả</small>
              <p>{nlpPreview.description || 'Không có'}</p>
            </div>
            <div className="rounded-2xl border border-slate-100/80 p-4 dark:border-slate-800">
              <small className="text-slate-500">Độ tin cậy</small>
              <p>{(nlpPreviewMeta?.avgConfidence ?? 0).toFixed(2)}</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <button className="button" type="button" onClick={handleConfirmPreview} disabled={loading}>
              {loading ? 'Đang lưu...' : 'Lưu giao dịch'}
            </button>
            <button className="button--ghost" type="button" onClick={handleCancelPreview} disabled={loading}>
              Chỉnh lại
            </button>
          </div>
        </section>
      )}

      <div className="grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
        <div className="glass-panel overflow-hidden">
          {summary ? (
            <ChartSummary summary={summary} />
          ) : (
            <div className="skeleton-card h-64 space-y-4">
              <div className="skeleton skeleton--title w-40" />
              <div className="skeleton skeleton--text w-full" />
              <div className="skeleton skeleton--text w-3/4" />
            </div>
          )}
        </div>
        <div className="glass-panel">
          <TransactionList data={transactions} />
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
  const looksLikeTransaction = (text) => {
    const normalized = text.toLowerCase();
    if (/\d/.test(normalized)) {
      return true;
    }
    const keywords = [
      'ăn',
      'uống',
      'mua',
      'chi',
      'thu',
      'trả',
      'tiền',
      'lương',
      'xăng',
      'phí',
      'đi',
      'nhận',
      'bán',
    ];
    return keywords.some((keyword) => normalized.includes(keyword));
  };
