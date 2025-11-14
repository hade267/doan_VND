import React from 'react';
import { Link } from 'react-router-dom';
import { WalletIcon, TrendUpIcon, TrendDownIcon, BrainIcon, ReceiptIcon } from '../components/icons';

const heroStats = [
  { label: 'Giao dịch/tháng', value: '27.5K', trend: '+18%' },
  { label: 'Độ chính xác NLP', value: '96%', trend: '+4%' },
  { label: 'Thời gian ghi', value: '< 7s', trend: 'Nhanh hơn 3x' },
];

const featureCards = [
  {
    icon: <WalletIcon size={22} />,
    title: 'Không chỉ là ví',
    desc: 'Quản lý đa nguồn thu, tài khoản ngân hàng và hạng mục ngân sách trong một dashboard hợp nhất.',
  },
  {
    icon: <TrendUpIcon size={22} />,
    title: 'Phân tích realtime',
    desc: 'Heatmap, biểu đồ quỹ và dự báo dòng tiền tức thời phục vụ ra quyết định nhanh.',
  },
  {
    icon: <TrendDownIcon size={22} />,
    title: 'NLP Spending Agent',
    desc: 'Hiểu tiếng Việt tự nhiên, tự động phân loại & gợi ý hành động tiếp theo.',
  },
];

const flowSteps = [
  { label: '01', title: 'Nhập câu lệnh', detail: '“Ăn tối cùng team 320k vào thứ sáu tới”' },
  { label: '02', title: 'MoneyWave phân tích', detail: 'Agent suy luận loại, danh mục, số tiền & gợi ý ngân sách liên quan.' },
  { label: '03', title: 'Xác nhận & đồng bộ', detail: 'Một tap để lưu, nhắc cảnh báo nếu vượt hạn mức hoặc cần ghi chú.' },
];

const HomePage = () => (
  <div className="space-y-14">
    <section className="rounded-[2.5rem] border border-slate-100/80 bg-gradient-to-br from-slate-900 via-slate-800 to-brand-dark p-8 text-white shadow-glass dark:border-slate-800 lg:p-12">
      <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-6">
          <p className="pill bg-white/15 text-white/80">MoneyWave v2</p>
          <div className="space-y-4">
            <h1 className="text-4xl font-semibold leading-tight sm:text-5xl">
              Điều phối tài chính cá nhân bằng trải nghiệm đậm chất tương lai.
            </h1>
            <p className="text-lg text-white/75">
              Dark mode nhất quán, dashboard modular và trợ lý NLP đa tầng giúp bạn ghi nhanh, phân tích sâu và kiểm soát ngân sách mọi lúc.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link className="button bg-white text-brand hover:-translate-y-0.5" to="/register">
              Dùng thử miễn phí
            </Link>
            <Link className="button--ghost border-white/40 text-white hover:border-white" to="/login">
              Tôi đã có tài khoản
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            {heroStats.map((stat) => (
              <div key={stat.label} className="rounded-3xl border border-white/15 bg-white/5 p-4">
                <p className="text-white/70">{stat.label}</p>
                <p className="mt-2 text-2xl font-semibold">{stat.value}</p>
                <span className="text-sm text-emerald-300">{stat.trend}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-[2rem] border border-white/10 bg-white/10 p-6 backdrop-blur">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="eyebrow text-white/70">Ví tổng</p>
                <h3 className="text-3xl font-semibold">8.200.000₫</h3>
              </div>
              <span className="badge bg-emerald-500/20 text-emerald-100">+1.2M hôm nay</span>
            </div>
            <div className="rounded-2xl border border-white/15 bg-white/5 p-4">
              <p className="text-sm text-white/70">Agent vừa gợi ý</p>
              <p className="mt-1 text-lg font-semibold">“Gặp khách hàng - 180k”</p>
              <p className="text-sm text-white/60">Danh mục: Tiếp khách · Ví công ty · Ghi chú: Dự án A1</p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-white/15 p-4">
                <span className="text-white/70">Thu nhập</span>
                <p className="text-3xl font-semibold">+15%</p>
                <p className="text-sm text-emerald-200">So với tuần trước</p>
              </div>
              <div className="rounded-2xl border border-white/15 p-4">
                <span className="text-white/70">Chi tiêu</span>
                <p className="text-3xl font-semibold">-8%</p>
                <p className="text-sm text-rose-200">Giảm nhờ cảnh báo</p>
              </div>
            </div>
            <div className="rounded-2xl border border-white/15 p-4">
              <p className="text-sm text-white/60">Pipeline NLP</p>
              <div className="mt-4 flex items-center gap-3">
                {['NER', 'RAG', 'Rule', 'Agent'].map((stage) => (
                  <span
                    key={stage}
                    className="inline-flex h-10 flex-1 items-center justify-center rounded-full bg-white/10 text-sm font-semibold"
                  >
                    {stage}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
      <div className="rounded-[2rem] border border-slate-100/80 bg-white/90 p-6 shadow-xl shadow-slate-200/50 dark:border-slate-800 dark:bg-slate-900/70">
        <p className="eyebrow">Tại sao chọn MoneyWave</p>
        <h2 className="mt-3 text-3xl font-semibold text-slate-900 dark:text-white">Thiết kế tối giản, công nghệ tối tân</h2>
        <p className="mt-3 text-slate-500 dark:text-slate-300">
          Từ freelancer đến doanh nghiệp nhỏ đều có thể chuẩn hoá việc ghi nhận chi tiêu với giao diện gọn gàng, dễ focus.
        </p>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {featureCards.map((feature) => (
            <article
              key={feature.title}
              className="rounded-3xl border border-slate-100/80 bg-white/80 p-5 shadow-sm shadow-slate-200/40 dark:border-slate-800 dark:bg-slate-900/70"
            >
              <span className="icon-badge mb-4">{feature.icon}</span>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{feature.title}</h3>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-300">{feature.desc}</p>
            </article>
          ))}
        </div>
      </div>
      <div className="rounded-[2rem] border border-slate-100/80 bg-gradient-to-b from-slate-900 to-slate-800 p-6 text-white shadow-xl shadow-slate-200/40 dark:border-slate-700">
        <p className="eyebrow text-white/70">Ví dụ sống động</p>
        <h3 className="mt-3 text-2xl font-semibold">“Cafe với khách hàng 180k chiều nay”</h3>
        <ul className="mt-6 space-y-4">
          <li className="flex gap-4 rounded-2xl border border-white/15 p-4">
            <ReceiptIcon size={22} />
            <div>
              <strong>Danh mục • Ăn uống & tiếp khách</strong>
              <p className="text-sm text-white/70">Tự động nhận diện từ câu lệnh, gắn vào ví công ty.</p>
            </div>
          </li>
          <li className="flex gap-4 rounded-2xl border border-white/15 p-4">
            <BrainIcon size={22} />
            <div>
              <strong>Gợi ý hành động</strong>
              <p className="text-sm text-white/70">Agent nhắc thêm ghi chú dự án A1 và cảnh báo hạn mức tiếp khách.</p>
            </div>
          </li>
        </ul>
        <p className="mt-6 rounded-2xl bg-white/10 px-4 py-3 text-sm text-white/80">
          Bước xác nhận giúp bạn chỉnh sửa mọi chi tiết trước khi đồng bộ sang giao dịch chính thức.
        </p>
      </div>
    </section>

    <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
      <div className="rounded-[2rem] border border-slate-100/80 bg-white/90 p-6 shadow-xl shadow-slate-200/50 dark:border-slate-800 dark:bg-slate-900/70">
        <p className="eyebrow">Trải nghiệm NLP</p>
        <h2 className="mt-2 text-2xl font-semibold text-slate-900 dark:text-white">Từ câu chữ đời thường tới báo cáo chuẩn xác</h2>
        <ol className="mt-6 space-y-5">
          {flowSteps.map((step) => (
            <li key={step.label} className="flex gap-4 rounded-3xl border border-slate-100/80 p-4 dark:border-slate-800">
              <span className="pill bg-brand/15 text-brand">{step.label}</span>
              <div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{step.title}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-300">{step.detail}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
      <div className="rounded-[2rem] border border-slate-100/80 bg-white/90 p-6 shadow-xl shadow-slate-200/50 dark:border-slate-800 dark:bg-slate-900/70">
        <p className="eyebrow">Dùng thử ngay</p>
        <h2 className="mt-3 text-3xl font-semibold text-slate-900 dark:text-white">Gia nhập MoneyWave trong 60 giây</h2>
        <p className="mt-2 text-slate-500 dark:text-slate-300">
          Tạo tài khoản miễn phí, mời đội nhóm và bắt đầu chuẩn hoá quy trình ghi chép tài chính với các cảnh báo thông minh.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link className="button" to="/register">
            Đăng ký ngay
          </Link>
          <Link className="button--ghost" to="/login">
            Tôi đã có tài khoản
          </Link>
        </div>
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-slate-100/80 p-4 dark:border-slate-800">
            <p className="text-sm text-slate-500 dark:text-slate-400">4.8/5</p>
            <p className="text-lg font-semibold text-slate-900 dark:text-white">Trải nghiệm người dùng</p>
            <p className="text-sm text-slate-500 dark:text-slate-400">Theo khảo sát cộng đồng MoneyWave.</p>
          </div>
          <div className="rounded-2xl border border-slate-100/80 p-4 dark:border-slate-800">
            <p className="text-sm text-slate-500 dark:text-slate-400">+120%</p>
            <p className="text-lg font-semibold text-slate-900 dark:text-white">Năng suất ghi chép</p>
            <p className="text-sm text-slate-500 dark:text-slate-400">Nhờ workflow NLP & cảnh báo ngân sách.</p>
          </div>
        </div>
      </div>
    </section>
  </div>
);

export default HomePage;
