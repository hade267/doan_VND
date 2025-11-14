import React, { useEffect, useState } from 'react';
import { fetchLogs, updateLog, reapplyLog } from '../services/nlpService';

const statusOptions = [
  { label: 'Tất cả', value: '' },
  { label: 'Thành công', value: 'success' },
  { label: 'Thất bại', value: 'failed' },
];

const formatDateTime = (value) => (value ? new Date(value).toLocaleString('vi-VN') : '');

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

  return (
    <div className="space-y-8">
      <header className="rounded-[2rem] border border-slate-100/80 bg-gradient-to-br from-slate-900 via-slate-800 to-brand-dark p-6 text-white shadow-glass sm:p-8">
        <div className="pill bg-white/20 text-white">NLP Logs</div>
        <h1 className="mt-4 text-3xl font-semibold">Theo dõi pipeline NLP</h1>
        <p className="mt-2 text-white/80">
          Giám sát và chỉnh sửa kết quả phân tích ngôn ngữ tự nhiên trong thời gian thực.
        </p>
      </header>

      <form className="card grid gap-4 md:grid-cols-[1fr_2fr_auto]" onSubmit={handleSearch}>
        <div>
          <label>Trạng thái</label>
          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            {statusOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label>Tìm kiếm</label>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Nội dung câu..."
          />
        </div>
        <div className="flex items-end">
          <button className="button w-full" type="submit" disabled={loading}>
            {loading ? 'Đang tải...' : 'Lọc'}
          </button>
        </div>
      </form>

      {error && <p className="error-text">{error}</p>}

      <section className="card space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="eyebrow">Nhật ký</p>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Tổng cộng {total} bản ghi</h2>
          </div>
          <button className="button--ghost" onClick={loadLogs} disabled={loading}>
            Tải lại
          </button>
        </div>
        <div className="table-responsive">
          <table className="min-w-[760px]">
            <thead>
              <tr>
                <th>Thời gian</th>
                <th>Nội dung</th>
                <th>Kết quả</th>
                <th>Engine</th>
                <th>Trạng thái</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id}>
                  <td>{formatDateTime(log.created_at)}</td>
                  <td className="max-w-xs">
                    <div className="text-sm text-slate-600 dark:text-slate-300">{log.input_text}</div>
                    {log.meta?.cached && <span className="badge bg-slate-200 text-slate-700">cached</span>}
                  </td>
                  <td className="align-top">
                    <pre className="max-h-48 overflow-auto rounded-2xl bg-slate-950/90 p-3 text-xs text-white dark:bg-slate-900">
                      {JSON.stringify(log.parsed_json, null, 2)}
                    </pre>
                  </td>
                  <td>{log.engine}</td>
                  <td>
                    <span className={log.is_success ? 'badge--success' : 'badge--danger'}>
                      {log.is_success ? 'OK' : 'Lỗi'}
                    </span>
                  </td>
                  <td>
                    <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                      <button className="button--ghost" type="button" onClick={() => openModal(log)}>
                        Chi tiết
                      </button>
                      <button className="button--ghost" type="button" onClick={() => toggleSuccess(log)}>
                        {log.is_success ? 'Đánh dấu lỗi' : 'Đánh dấu đúng'}
                      </button>
                      <button className="button--ghost" type="button" onClick={() => handleReapply(log)}>
                        Re-apply
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!logs.length && !loading && <p className="p-4 text-sm text-slate-500">Chưa có dữ liệu.</p>}
        </div>
      </section>

      {modalLog && (
        <div className="modal-overlay">
          <div className="modal space-y-4">
            <div className="modal__header">
              <div>
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white">Chỉnh sửa NLP Log</h3>
                <p className="text-sm text-slate-500 dark:text-slate-300">{modalLog.input_text}</p>
              </div>
              <button className="icon-button" onClick={closeModal} type="button" aria-label="Đóng">
                ✕
              </button>
            </div>
            <div className="modal__body">
              <div>
                <label>Danh mục</label>
                <input
                  value={corrections.category}
                  onChange={(e) => setCorrections((prev) => ({ ...prev, category: e.target.value }))}
                />
              </div>
              <div>
                <label>Số tiền</label>
                <input
                  type="number"
                  value={corrections.amount}
                  onChange={(e) => setCorrections((prev) => ({ ...prev, amount: Number(e.target.value) }))}
                />
              </div>
              <div>
                <label>Mô tả</label>
                <input
                  value={corrections.description}
                  onChange={(e) => setCorrections((prev) => ({ ...prev, description: e.target.value }))}
                />
              </div>
              <div>
                <label>Feedback</label>
                <textarea value={feedbackText} onChange={(e) => setFeedbackText(e.target.value)} rows={3} />
              </div>
            </div>
            <div className="modal__footer">
              <button className="button--ghost" type="button" onClick={saveCorrections}>
                Lưu chỉnh sửa
              </button>
              <button className="button" type="button" onClick={reapplyFromModal}>
                Re-apply với chỉnh sửa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NlpLogsPage;
