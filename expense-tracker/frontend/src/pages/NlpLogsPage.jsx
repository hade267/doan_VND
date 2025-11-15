import React, { useEffect, useState } from 'react';
import DOMPurify from 'dompurify';
import { fetchLogs, updateLog, reapplyLog } from '../services/nlpService';

const statusOptions = [
  { label: 'Tất cả', value: '' },
  { label: 'Thành công', value: 'success' },
  { label: 'Thất bại', value: 'failed' },
];

const formatDateTime = (value) => (value ? new Date(value).toLocaleString('vi-VN') : '');
const sanitizeText = (value = '') => DOMPurify.sanitize(String(value ?? ''));

const Metric = ({ label, value, accent }) => (
  <div className="rounded-2xl border border-white/15 bg-white/10 p-4 text-white">
    <p className="text-sm text-white/70">{label}</p>
    <p className="mt-1 text-2xl font-semibold">
      {value}
      {accent && <span className={`ml-2 align-middle text-xs ${accent}`}>realtime</span>}
    </p>
  </div>
);

const TimelineCard = ({ log, onOpen, onToggle, onReapply }) => (
  <article className="card gap-4 border-l-4 border-brand/60 bg-gradient-to-br from-white via-slate-50 to-white dark:from-[#0b1120] dark:via-slate-900 dark:to-[#0b1120] sm:flex sm:items-start">
    <div className="flex-1 space-y-3">
      <div className="flex flex-wrap items-center gap-3">
        <span className="pill bg-brand/10 text-brand">{formatDateTime(log.created_at)}</span>
        <span className={`pill ${log.is_success ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
          {log.is_success ? 'Thành công' : 'Thất bại'}
        </span>
        {log.meta?.cached && <span className="pill bg-slate-200 text-slate-700">Cached</span>}
        <span className="pill bg-slate-900/10 text-slate-600 dark:bg-slate-800 dark:text-slate-200">
          Engine: {log.engine}
        </span>
      </div>
      <p className="text-sm font-medium text-slate-900 dark:text-white">{sanitizeText(log.input_text)}</p>
      <div className="grid gap-3 md:grid-cols-2">
        <div>
          <p className="eyebrow">Kết quả phân tích</p>
          <pre className="max-h-48 overflow-auto rounded-2xl bg-slate-950/90 p-3 text-xs text-white dark:bg-slate-900">
            {sanitizeText(JSON.stringify(log.parsed_json, null, 2))}
          </pre>
        </div>
        <div className="space-y-3">
          <p className="eyebrow">Chỉnh sửa gần nhất</p>
          <div className="rounded-2xl border border-slate-100/80 bg-white/60 p-3 text-sm dark:border-slate-800 dark:bg-slate-900/40">
            {log.corrections ? (
              <pre className="text-xs text-slate-700 dark:text-slate-200">
                {sanitizeText(JSON.stringify(log.corrections, null, 2))}
              </pre>
            ) : (
              <span className="text-slate-500">Chưa có</span>
            )}
          </div>
          {log.feedback && (
            <div>
              <p className="eyebrow">Feedback</p>
              <p className="rounded-xl bg-slate-100/80 p-2 text-sm text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                {sanitizeText(log.feedback)}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
    <div className="flex flex-col gap-2 sm:w-48">
      <button className="button--ghost" type="button" onClick={onOpen}>
        Chi tiết
      </button>
      <button className="button--ghost" type="button" onClick={onToggle}>
        {log.is_success ? 'Đánh dấu lỗi' : 'Đánh dấu đúng'}
      </button>
      <button className="button--ghost" type="button" onClick={onReapply}>
        Re-apply
      </button>
    </div>
  </article>
);

const NlpLogsPage = () => {
  const [logs, setLogs] = useState([]);
  const [total, setTotal] = useState(0);
  const [status, setStatus] = useState('');
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [modalLog, setModalLog] = useState(null);
  const [corrections, setCorrections] = useState({ category: '', amount: '', description: '' });
  const [feedbackText, setFeedbackText] = useState('');

  const loadLogs = async () => {
    setLoading(true);
    try {
      const data = await fetchLogs({
        status: status || undefined,
        q: query || undefined,
        limit: 50,
      });
      setLogs(data.items || []);
      setTotal(data.total || 0);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể tải log.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, [status]);

  const handleSearch = (e) => {
    e.preventDefault();
    loadLogs();
  };

  const toggleSuccess = async (log) => {
    try {
      await updateLog(log.id, { is_success: !log.is_success });
      loadLogs();
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể cập nhật log.');
    }
  };

  const handleReapply = async (log) => {
    try {
      await reapplyLog(log.id, log.corrections || {});
      await updateLog(log.id, { feedback: 'Re-applied', is_success: true });
      loadLogs();
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể re-apply log.');
    }
  };

  const openModal = (log) => {
    const base = log.corrections || log.parsed_json || {};
    setCorrections({
      category: base.category || '',
      amount: base.amount || '',
      description: base.description || '',
    });
    setFeedbackText(log.feedback || '');
    setModalLog(log);
  };

  const closeModal = () => setModalLog(null);

  const saveCorrections = async () => {
    if (!modalLog) return;
    try {
      await updateLog(modalLog.id, {
        corrections,
        feedback: feedbackText,
      });
      loadLogs();
      closeModal();
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể lưu chỉnh sửa.');
    }
  };

  const reapplyFromModal = async () => {
    if (!modalLog) return;
    try {
      await reapplyLog(modalLog.id, corrections);
      await updateLog(modalLog.id, { feedback: feedbackText, is_success: true, corrections });
      loadLogs();
      closeModal();
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể re-apply log.');
    }
  };

  const successCount = logs.filter((log) => log.is_success).length;
  const failedCount = logs.length - successCount;

  return (
    <div className="space-y-8">
      <header className="rounded-[2rem] border border-slate-100/80 bg-gradient-to-br from-slate-900 via-slate-800 to-brand-dark p-6 text-white shadow-glass sm:p-8">
        <div className="pill bg-white/20 text-white">NLP Logs</div>
        <div className="mt-4 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-3xl font-semibold">Theo dõi pipeline NLP</h1>
            <p className="mt-2 text-white/80">
              Giám sát chi tiết các câu lệnh người dùng, đánh dấu lỗi và thực hiện re-apply ngay trong giao diện.
            </p>
          </div>
          <button className="button--ghost border-white/40 text-white" onClick={loadLogs} disabled={loading}>
            {loading ? 'Đang tải...' : 'Làm mới dữ liệu'}
          </button>
        </div>
        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <Metric label="Tổng log" value={total} />
          <Metric label="Đúng" value={successCount} accent="badge--success" />
          <Metric label="Lỗi" value={failedCount} accent="badge--danger" />
        </div>
      </header>

      <section className="card space-y-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-end">
          <div className="flex-1">
            <label>Trạng thái</label>
            <div className="flex flex-wrap gap-2">
              {statusOptions.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  className={`pill ${status === opt.value ? 'bg-brand text-white' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-white'}`}
                  onClick={() => setStatus(opt.value)}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
          <form className="flex w-full flex-col gap-2 md:max-w-sm" onSubmit={handleSearch}>
            <label>Tìm kiếm theo nội dung</label>
            <div className="flex gap-2">
              <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Ví dụ: chi cafe, nhận tiền..." />
              <button className="button" type="submit" disabled={loading}>
                Lọc
              </button>
            </div>
          </form>
        </div>
        {error && <p className="error-text">{error}</p>}
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="eyebrow">Dòng thời gian</p>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Nhật ký gần nhất</h2>
          </div>
        </div>
        <div className="space-y-4">
          {logs.length === 0 && <div className="card text-sm text-slate-500">Không có log nào phù hợp với bộ lọc.</div>}
          {logs.map((log) => (
            <TimelineCard
              key={log.id}
              log={log}
              onOpen={() => openModal(log)}
              onToggle={() => toggleSuccess(log)}
              onReapply={() => handleReapply(log)}
            />
          ))}
        </div>
      </section>

      {modalLog && (
        <div className="modal">
          <div className="modal__content space-y-4">
            <h3 className="text-lg font-semibold">Chi tiết log</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label>Danh mục</label>
                <input value={corrections.category} onChange={(e) => setCorrections((prev) => ({ ...prev, category: e.target.value }))} />
              </div>
              <div>
                <label>Số tiền</label>
                <input value={corrections.amount} onChange={(e) => setCorrections((prev) => ({ ...prev, amount: e.target.value }))} />
              </div>
              <div className="md:col-span-2">
                <label>Mô tả</label>
                <input value={corrections.description} onChange={(e) => setCorrections((prev) => ({ ...prev, description: e.target.value }))} />
              </div>
            </div>
            <div>
              <label>Feedback</label>
              <textarea rows={3} value={feedbackText} onChange={(e) => setFeedbackText(e.target.value)} />
            </div>
            <div className="flex flex-wrap gap-3">
              <button className="button" type="button" onClick={saveCorrections}>
                Lưu chỉnh sửa
              </button>
              <button className="button--ghost" type="button" onClick={reapplyFromModal}>
                Re-apply + Đánh dấu đúng
              </button>
              <button className="button--ghost" type="button" onClick={closeModal}>
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NlpLogsPage;
