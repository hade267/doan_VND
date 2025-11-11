import React from 'react';

const formatCurrency = (value = 0) =>
  Number(value || 0).toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });

const ChartSummary = ({ summary }) => {
  if (!summary) {
    return null;
  }

  return (
    <div className="card">
      <h2>Tổng quan</h2>
      <div className="summary-grid">
        <div className="summary-card summary-card--income">
          <p>Thu nhập</p>
          <strong>{formatCurrency(summary.totalIncome)}</strong>
        </div>
        <div className="summary-card summary-card--expense">
          <p>Chi tiêu</p>
          <strong>{formatCurrency(summary.totalExpense)}</strong>
        </div>
        <div className="summary-card summary-card--balance">
          <p>Cân bằng</p>
          <strong>{formatCurrency(summary.balance)}</strong>
        </div>
      </div>

      <div className="summary-section">
        <h3>Theo tháng</h3>
        {summary.monthly?.map((item) => (
          <div key={item.month} className="summary-row">
            <span>{new Date(item.month).toLocaleDateString('vi-VN', { month: 'short', year: 'numeric' })}</span>
            <div className="summary-row__values">
              <span className="badge badge--income">{formatCurrency(item.income)}</span>
              <span className="badge badge--expense">{formatCurrency(item.expense)}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="summary-section">
        <h3>Theo danh mục</h3>
        {summary.categoryBreakdown?.map((item) => (
          <div key={`${item.category?.name}-${item.type}`} className="summary-row">
            <span>
              {item.category?.name || 'Khác'} ({item.type === 'income' ? 'thu' : 'chi'})
            </span>
            <span>{formatCurrency(item.total)}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ChartSummary;
