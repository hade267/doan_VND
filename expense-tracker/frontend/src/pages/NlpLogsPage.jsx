import React, { useEffect, useState } from 'react';
import { fetchLogs, updateLog, reapplyLog } from '../services/nlpService';

const statusOptions = [
  { label: 'Tất cả', value: '' },
  { label: 'Thành công', value: 'success' },
  { label: 'Thất bại', value: 'failed' },
];

const formatDateTime = (value) =>
  value ? new Date(value).toLocaleString('vi-VN') : '';

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
      setError(err.response?.data?.message || 'Không thể reapply log.');
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
        corrections: corrections,
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
      setError(err.response?.data?.message || 'Không thể reapply log.');
    }
  };

  return (
    <div className="nlp-logs">
      <header className="nlp-logs__header">
        <div>
          <h1>NLP Logs</h1>
          <p>Giám sát và chỉnh sửa kết quả phân tích ngôn ngữ tự nhiên.</p>
        </div>
      </header>

      <form className="nlp-logs__filters" onSubmit={handleSearch}>
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
        <button className="button" type="submit" disabled={loading}>
          {loading ? 'Đang tải...' : 'Lọc'}
        </button>
      </form>

      {error && <p className="error-text">{error}</p>}

      <div className="card nlp-logs__table">
        <div className="nlp-logs__summary">
          <span>Tổng cộng: {total}</span>
          <button className="button button--ghost" onClick={loadLogs} disabled={loading}>
            Tải lại
          </button>
        </div>
        <div className="table-responsive">
          <table>
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
                  <td>
                    <div className="nlp-logs__text">{log.input_text}</div>
                    {log.meta?.cached && <span className="badge">cached</span>}
                  </td>
                  <td className="nlp-logs__result">
                    <pre>{JSON.stringify(log.parsed_json, null, 2)}</pre>
                  </td>
                  <td>{log.engine}</td>
                  <td>
                    <span className={`badge ${log.is_success ? 'badge--success' : 'badge--danger'}`}>
                      {log.is_success ? 'OK' : 'Lỗi'}
                    </span>
                  </td>
                  <td className="nlp-logs__actions">
                    <button className="button button--ghost" onClick={() => openModal(log)}>
                      Chi tiết
                    </button>
                    <button className="button button--ghost" onClick={() => toggleSuccess(log)}>
                      {log.is_success ? 'Đánh dấu lỗi' : 'Đánh dấu đúng'}
                    </button>
                    <button className="button button--ghost" onClick={() => handleReapply(log)}>
                      Re-apply
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!logs.length && !loading && <p>Chưa có dữ liệu.</p>}
        </div>
      </div>

      {modalLog && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal__header">
              <h3>Chỉnh sửa NLP Log</h3>
              <button className="icon-button" onClick={closeModal}>
                ✕
              </button>
            </div>
            <div className="modal__body">
              <div className="auth__form-group">
                <label>Danh mục</label>
                <input
                  value={corrections.category}
                  onChange={(e) => setCorrections((prev) => ({ ...prev, category: e.target.value }))}
                />
              </div>
              <div className="auth__form-group">
                <label>Số tiền</label>
                <input
                  type="number"
                  value={corrections.amount}
                  onChange={(e) => setCorrections((prev) => ({ ...prev, amount: Number(e.target.value) }))}
                />
              </div>
              <div className="auth__form-group">
                <label>Mô tả</label>
                <input
                  value={corrections.description}
                  onChange={(e) => setCorrections((prev) => ({ ...prev, description: e.target.value }))}
                />
              </div>
              <div className="auth__form-group">
                <label>Feedback</label>
                <textarea value={feedbackText} onChange={(e) => setFeedbackText(e.target.value)} rows={3} />
              </div>
            </div>
            <div className="modal__footer">
              <button className="button button--ghost" onClick={saveCorrections}>
                Lưu chỉnh sửa
              </button>
              <button className="button" onClick={reapplyFromModal}>
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
