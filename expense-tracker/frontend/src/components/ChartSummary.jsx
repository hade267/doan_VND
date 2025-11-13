import React from 'react';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
} from 'chart.js';
import { Doughnut, Line } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement);

const formatCurrency = (value = 0) =>
  Number(value || 0).toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });

const ChartSummary = ({ summary }) => {
  if (!summary) {
    return null;
  }

  const monthlyLabels =
    summary.monthly?.map((item) =>
      new Date(item.month).toLocaleDateString('vi-VN', { month: 'short', year: 'numeric' })
    ) || [];
  const incomeSeries = summary.monthly?.map((item) => item.income || 0) || [];
  const expenseSeries = summary.monthly?.map((item) => item.expense || 0) || [];

  const expenseCategories =
    summary.categoryBreakdown
      ?.filter((item) => item.type === 'expense')
      .slice(0, 6)
      .map((item) => ({
        name: item.category?.name || 'Khác',
        value: Number(item.total) || 0,
      })) || [];

  const doughnutData = {
    labels: expenseCategories.map((item) => item.name),
    datasets: [
      {
        data: expenseCategories.map((item) => item.value),
        backgroundColor: ['#1ec58f', '#0f9c6f', '#f97316', '#fcd34d', '#a855f7', '#38bdf8'],
        borderWidth: 0,
      },
    ],
  };

  const lineData = {
    labels: monthlyLabels,
    datasets: [
      {
        label: 'Thu nhập',
        data: incomeSeries,
        borderColor: '#1ec58f',
        tension: 0.35,
        fill: false,
      },
      {
        label: 'Chi tiêu',
        data: expenseSeries,
        borderColor: '#ef4444',
        tension: 0.35,
        fill: false,
      },
    ],
  };

  const lineOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom',
      },
    },
    scales: {
      y: {
        ticks: {
          callback: (value) => `${(value / 1_000_000).toFixed(0)}tr`,
        },
      },
    },
  };

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

      <div className="chart-grid">
        <div className="chart-card">
          <h3>Xu hướng thu/chi</h3>
          {monthlyLabels.length ? (
            <Line data={lineData} options={lineOptions} />
          ) : (
            <p className="transaction-item__meta">Chưa đủ dữ liệu để vẽ biểu đồ.</p>
          )}
        </div>
        <div className="chart-card">
          <h3>Chi tiêu theo danh mục</h3>
          {expenseCategories.length ? (
            <Doughnut data={doughnutData} options={{ plugins: { legend: { position: 'bottom' } } }} />
          ) : (
            <p className="transaction-item__meta">Không có dữ liệu chi tiêu.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChartSummary;
