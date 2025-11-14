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
import { Doughnut, Line, Pie } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement);

const formatCurrency = (value = 0) =>
  Number(value || 0).toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });

const ChartSummary = ({ summary }) => {
  if (!summary) {
    return null;
  }

  const monthlyLabels =
    summary.monthly?.map((item) =>
      new Date(item.month).toLocaleDateString('vi-VN', { month: 'short', year: 'numeric' }),
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
        borderWidth: 1,
        borderColor: '#f8fafc',
      },
    ],
  };

  const incomeExpensePie = {
    labels: ['Thu nhập', 'Chi tiêu'],
    datasets: [
      {
        data: [Number(summary.totalIncome) || 0, Number(summary.totalExpense) || 0],
        backgroundColor: ['#22c55e', '#f87171'],
        borderWidth: 1,
        borderColor: '#f8fafc',
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
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          usePointStyle: true,
        },
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
    <div className="card space-y-6">
      <div>
        <p className="eyebrow">Tổng quan</p>
        <h2 className="text-xl font-semibold">Thống kê thu chi</h2>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl bg-brand/10 p-4">
          <p className="text-sm text-slate-500">Thu nhập</p>
          <p className="mt-1 text-2xl font-semibold text-brand">{formatCurrency(summary.totalIncome)}</p>
        </div>
        <div className="rounded-2xl bg-rose-100/60 p-4 dark:bg-rose-500/20">
          <p className="text-sm text-slate-500">Chi tiêu</p>
          <p className="mt-1 text-2xl font-semibold text-rose-500 dark:text-rose-200">
            {formatCurrency(summary.totalExpense)}
          </p>
        </div>
        <div className="rounded-2xl bg-slate-900 text-white p-4 dark:bg-slate-800">
          <p className="text-sm text-slate-200/80">Cân bằng</p>
          <p className="mt-1 text-2xl font-semibold">{formatCurrency(summary.balance)}</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-3xl border border-slate-100/80 bg-white/70 p-4 shadow-inner shadow-slate-200/60 dark:border-slate-800 dark:bg-slate-900/40 lg:col-span-2">
          <h3 className="mb-3 text-base font-semibold text-slate-700 dark:text-slate-200">Xu hướng thu / chi</h3>
          {monthlyLabels.length ? (
            <div className="h-60">
              <Line data={lineData} options={lineOptions} />
            </div>
          ) : (
            <p className="text-sm text-slate-500">Chưa đủ dữ liệu để hiển thị biểu đồ.</p>
          )}
        </div>
        <div className="rounded-3xl border border-slate-100/80 bg-white/70 p-4 shadow-inner shadow-slate-200/60 dark:border-slate-800 dark:bg-slate-900/40">
          <h3 className="mb-3 text-base font-semibold text-slate-700 dark:text-slate-200">Chi tiêu theo danh mục</h3>
          {expenseCategories.length ? (
            <div className="flex h-60 flex-col">
              <div className="flex-1">
                <Doughnut
                  data={doughnutData}
                  options={{
                    plugins: { legend: { position: 'bottom', labels: { usePointStyle: true } } },
                    maintainAspectRatio: false,
                  }}
                />
              </div>
            </div>
          ) : (
            <p className="text-sm text-slate-500">Không có dữ liệu chi tiêu.</p>
          )}
        </div>
        <div className="rounded-3xl border border-slate-100/80 bg-white/70 p-4 shadow-inner shadow-slate-200/60 dark:border-slate-800 dark:bg-slate-900/40">
          <h3 className="mb-3 text-base font-semibold text-slate-700 dark:text-slate-200">Tỷ lệ thu vs chi</h3>
          <div className="h-60">
            <Pie
              data={incomeExpensePie}
              options={{
                plugins: { legend: { position: 'bottom', labels: { usePointStyle: true } } },
                maintainAspectRatio: false,
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChartSummary;
