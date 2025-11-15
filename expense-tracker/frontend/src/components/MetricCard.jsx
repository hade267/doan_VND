import React from 'react';

const MetricCard = ({ title, value, delta, hint, icon: Icon }) => (
  <div className="metric-card relative overflow-hidden">
    <div className="flex items-center justify-between">
      <p className="metric-card__title">{title}</p>
      {Icon && (
        <span className="icon-badge border-transparent bg-brand/15 text-brand dark:bg-brand/30 dark:text-white">
          <Icon size={16} />
        </span>
      )}
    </div>
    <p className="metric-card__value">{value}</p>
    {delta && <span className="metric-card__delta">{delta}</span>}
    {hint && <p className="mt-2 text-xs text-slate-400 dark:text-slate-500">{hint}</p>}
  </div>
);

export default MetricCard;
