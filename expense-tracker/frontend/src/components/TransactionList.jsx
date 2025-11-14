import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ReceiptIcon, TrendDownIcon, TrendUpIcon } from './icons';

const TransactionList = ({ data = [] }) => {
  const navigate = useNavigate();
  const renderIcon = (type) => {
    if (type === 'income') return <TrendUpIcon size={18} />;
    if (type === 'expense') return <TrendDownIcon size={18} />;
    return <ReceiptIcon size={18} />;
  };

  return (
    <div className="card space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="eyebrow">Hoạt động</p>
          <h2 className="text-xl font-semibold">Giao dịch gần đây</h2>
        </div>
        <button className="button--ghost" type="button" onClick={() => navigate('/transactions')}>
          Xem tất cả
        </button>
      </div>
      {!data.length ? (
        <p className="text-sm text-slate-500 dark:text-slate-400">Chưa có giao dịch nào.</p>
      ) : (
        <ul className="space-y-3">
          {data.map((item) => {
            const categoryName = item.category?.name || 'Không phân loại';
            return (
              <li
                key={item.id}
                className="flex items-center justify-between rounded-2xl border border-slate-100/80 px-4 py-3 shadow-sm shadow-slate-200/60 dark:border-slate-800 dark:shadow-slate-900/20"
              >
                <div className="flex items-center gap-3">
                  <span className="icon-badge" aria-hidden="true">
                    {renderIcon(item.type)}
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">
                      {item.description || categoryName}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {new Date(item.transaction_date).toLocaleDateString()} · {categoryName}
                    </p>
                  </div>
                </div>
                <span className={item.type === 'income' ? 'badge--income' : 'badge--expense'}>
                  {item.type === 'income' ? '+' : '-'}
                  {Number(item.amount).toLocaleString('vi-VN')} ₫
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default TransactionList;
