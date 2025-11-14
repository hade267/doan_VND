import React from 'react';
import { Link } from 'react-router-dom';
import { WalletIcon, TrendUpIcon, TrendDownIcon, BrainIcon, ReceiptIcon } from '../components/icons';

const highlights = [
  {
    icon: <WalletIcon size={20} />,
    title: 'Ví thông minh',
    desc: 'Theo dõi đa ví, đồng bộ số dư và hạn mức trong một bảng điều khiển.',
  },
  {
    icon: <TrendUpIcon size={20} />,
    title: 'Biểu đồ realtime',
    desc: 'Xem nhanh xu hướng thu chi, ngân sách và cảnh báo vượt hạn.',
  },
  {
    icon: <TrendDownIcon size={20} />,
    title: 'NLP ghi nhanh',
    desc: 'Nhập “đi chợ 200k” là giao dịch đã sẵn sàng lưu với gợi ý thông minh.',
  },
];

const HomePage = () => (
  <div className="space-y-12">
    <header className="grid gap-8 lg:grid-cols-2">
      <div className="space-y-6">
        <p className="pill">MoneyLover Inspired</p>
        <h1 className="text-3xl font-semibold text-slate-900 dark:text-white sm:text-4xl">
          Quản lý chi tiêu đẹp mắt & trực quan
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-300">
          MoneyWave tái hiện tinh thần Money Lover với dark mode, sidebar thông minh và trợ lý NLP.
        </p>
        <div className="flex flex-wrap gap-3">
          <Link className="button" to="/register">
            Đăng ký miễn phí
          </Link>
          <Link className="button--ghost" to="/login">
            Đăng nhập
          </Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          {highlights.map((item) => (
            <article
              key={item.title}
              className="rounded-3xl border border-slate-100/80 bg-white/80 p-4 shadow-sm shadow-slate-200/60 dark:border-slate-800 dark:bg-slate-900/60"
            >
              <span className="icon-badge mb-3">{item.icon}</span>
              <h3 className="text-base font-semibold">{item.title}</h3>
              <p className="text-sm text-slate-500 dark:text-slate-300">{item.desc}</p>
            </article>
          ))}
        </div>
      </div>
      <div className="rounded-[2rem] border border-slate-100/80 bg-gradient-to-br from-slate-900 via-slate-800 to-brand-dark p-6 text-white shadow-glass dark:border-slate-800 sm:p-8">
        <div className="space-y-6">
          <div>
            <p className="eyebrow text-white/70">Ngân sách còn lại</p>
            <h3 className="text-4xl font-semibold">8.200.000₫</h3>
          </div>
          <div className="rounded-3xl border border-white/20 p-4">
            <p className="eyebrow text-white/70">Ghi nhanh NLP</p>
            <strong className="text-lg">"Cafe khách hàng 180k"</strong>
            <p className="mt-2 text-sm text-white/70">
              Trợ lý tự động hiểu danh mục, số tiền và đề xuất ghi chú phù hợp.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-3xl border border-white/20 p-4">
              <span className="text-sm text-white/70">Thu</span>
              <p className="text-2xl font-semibold">+15%</p>
            </div>
            <div className="rounded-3xl border border-white/20 p-4">
              <span className="text-sm text-white/70">Chi</span>
              <p className="text-2xl font-semibold">-8%</p>
            </div>
          </div>
        </div>
      </div>
    </header>

    <section className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="eyebrow">NLP Spending Agent</p>
          <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">Hiểu ngôn ngữ đời sống</h2>
        </div>
        <p className="text-sm text-slate-500 dark:text-slate-300">
          Pipeline nhiều tầng giúp tăng độ chính xác và luôn hỏi bạn trước khi lưu xuống sổ.
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-4">
        {['NER', 'RAG', 'Rule', 'Agent'].map((label) => (
          <article
            key={label}
            className="rounded-3xl border border-slate-100/80 bg-white/80 p-5 shadow-sm shadow-slate-200/60 dark:border-slate-800 dark:bg-slate-900/60"
          >
            <span className="badge bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-200">{label}</span>
            <h3 className="mt-3 text-lg font-semibold">Tầng {label}</h3>
            <p className="text-sm text-slate-500 dark:text-slate-300">
              {label === 'NER' && 'Tìm entity như số tiền, loại giao dịch, địa điểm.'}
              {label === 'RAG' && 'Kết hợp lịch sử và rule doanh nghiệp khi gợi ý.'}
              {label === 'Rule' && 'Áp dụng hạn mức, mapping danh mục và chuẩn hoá.'}
              {label === 'Agent' && 'Đề xuất hành động tiếp theo & nhắc xác nhận.'}
            </p>
          </article>
        ))}
      </div>
      <div className="rounded-[2rem] border border-slate-100/80 bg-white/80 p-6 shadow-xl shadow-slate-200/60 dark:border-slate-800 dark:bg-slate-900/70">
        <div className="space-y-4">
          <div>
            <p className="eyebrow">Ví dụ</p>
            <h3 className="text-xl font-semibold">
              "Cafe với khách hàng 180k chiều nay"
            </h3>
          </div>
          <ul className="space-y-3">
            <li className="flex items-start gap-3 rounded-2xl border border-slate-100/80 p-3 dark:border-slate-800">
              <ReceiptIcon size={20} />
              <span>
                <strong>Danh mục</strong>
                <p>Ăn uống & tiếp khách</p>
              </span>
            </li>
            <li className="flex items-start gap-3 rounded-2xl border border-slate-100/80 p-3 dark:border-slate-800">
              <BrainIcon size={20} />
              <span>
                <strong>Gợi ý</strong>
                <p>Ghi vào ví công ty, thêm ghi chú dự án A1.</p>
              </span>
            </li>
          </ul>
          <p className="rounded-2xl bg-brand/10 px-4 py-3 text-sm text-brand-dark">
            Bước xác nhận giúp bạn chỉnh sửa mọi thứ trước khi lưu.
          </p>
        </div>
      </div>
    </section>

    <section className="rounded-[2rem] border border-slate-100/80 bg-gradient-to-r from-brand to-emerald-500 p-8 text-white shadow-glass dark:border-emerald-400/30">
      <div className="grid gap-6 lg:grid-cols-2">
        <div>
          <p className="eyebrow text-white/70">Sẵn sàng?</p>
          <h2 className="text-3xl font-semibold">Tham gia MoneyWave ngay hôm nay</h2>
          <p className="mt-3 text-white/80">
            Tạo tài khoản miễn phí, mời đội nhóm và bắt đầu quản lý chi tiêu thông minh.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Link className="button bg-white/90 text-brand" to="/register">
            Đăng ký ngay
          </Link>
          <Link className="button--ghost border-white/50 text-white hover:border-white" to="/login">
            Tôi đã có tài khoản
          </Link>
        </div>
      </div>
    </section>
  </div>
);

export default HomePage;
