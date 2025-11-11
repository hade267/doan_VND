import React from 'react';

const TransactionList = ({ data = [] }) => {
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
                <div>
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
