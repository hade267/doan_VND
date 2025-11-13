import React from 'react';
import { ReceiptIcon, TrendDownIcon, TrendUpIcon } from './icons';

const TransactionList = ({ data = [] }) => {
  const renderIcon = (type) => {
    if (type === 'income') return <TrendUpIcon size={18} />;
    if (type === 'expense') return <TrendDownIcon size={18} />;
    return <ReceiptIcon size={18} />;
  };

  return (
    <div className="card">
      <h2>Giao dịch gần đây</h2>
      {!data.length ? (
        <p className="transaction-item__meta">Chưa có giao dịch nào.</p>
      ) : (
        <ul className="list">
          {data.map((item) => {
            const categoryName = item.category?.name || 'Không phân loại';
            return (
              <li key={item.id} className="transaction-item">
                <div className="transaction-item__info">
                  <span className="icon-badge">{renderIcon(item.type)}</span>
                  <div className="transaction-item__title">{item.description || categoryName}</div>
                  <div className="transaction-item__meta">
                    {new Date(item.transaction_date).toLocaleDateString()} • {categoryName}
                  </div>
                </div>
                <span className={`badge badge--${item.type === 'income' ? 'income' : 'expense'}`}>
                  {item.type === 'income' ? '+' : '-'}
                  {Number(item.amount).toLocaleString('vi-VN')} đ
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
