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
    desc: 'Nhập “Ăn trưa 120k” là giao dịch được nhận diện và chờ bạn xác nhận.',
  },
];

const HomePage = () => (
  <div className="home space-y-12">
    <header className="home__hero home__hero--minimal flex flex-col gap-8 lg:flex-row">
      <div className="home__hero-text">
        <img className="home__hero-logo" src="/logo_light.png" alt="MoneyWave" />
        <h1>Quản lý chi tiêu đẹp mắt & trực quan</h1>
        <p>MoneyWave tái hiện cảm hứng Money Lover với dark mode, sidebar thông minh và trợ lý NLP.</p>
        <div className="home__actions">
          <Link className="button" to="/register">
            Dùng thử miễn phí
          </Link>
          <Link className="button button--ghost" to="/login">
            Đăng nhập
          </Link>
        </div>
      </div>
      <div className="home__hero-media home__hero-media--minimal">
        <div className="home__glass-card">
          <div>
            <p className="eyebrow">Ngân sách còn lại</p>
            <h3>8.200.000đ</h3>
          </div>
          <div>
            <p className="eyebrow">Ghi nhanh NLP</p>
            <strong>"Cafe khách hàng 180k"</strong>
          </div>
          <div className="home__hero-mini">
            <div>
              <span>Thu</span>
              <strong>+15%</strong>
            </div>
            <div>
              <span>Chi</span>
              <strong>-8%</strong>
            </div>
          </div>
        </div>
      </div>
    </header>

    <section className="home__section home__highlights grid gap-6 md:grid-cols-3">
      {highlights.map((item) => (
        <article key={item.title}>
          <span className="icon-badge">{item.icon}</span>
          <h3>{item.title}</h3>
          <p>{item.desc}</p>
        </article>
      ))}
    </section>

    <section className="home__section home__nlp space-y-8">
      <div className="home__section-head">
        <div>
          <p className="eyebrow">NLP Spending Agent</p>
          <h2>Hiểu ngôn ngữ đời sống, ghi giao dịch chuẩn xác</h2>
        </div>
        <p>Pipeline bốn lớp giúp tăng độ chính xác và luôn có bước xác nhận trước khi lưu.</p>
      </div>
      <div className="home__nlp-grid grid gap-4 md:grid-cols-4">
        <article>
          <span className="icon-badge icon-badge--accent">NER</span>
          <h3>Nhận diện thực thể</h3>
          <p>Tìm số tiền, thể loại, ví, người tham gia từ câu nói hàng ngày.</p>
        </article>
        <article>
          <span className="icon-badge icon-badge--accent">RAG</span>
          <h3>Hiểu ngữ cảnh</h3>
          <p>Kết hợp lịch sử chi tiêu và rule doanh nghiệp để cung cấp gợi ý phù hợp.</p>
        </article>
        <article>
          <span className="icon-badge icon-badge--accent">Rule</span>
          <h3>Chính sách riêng</h3>
          <p>Áp dụng hạn mức, mapping danh mục và chuẩn hoá đơn vị tiền tệ.</p>
        </article>
        <article>
          <span className="icon-badge icon-badge--accent">Agent</span>
          <h3>Tác vụ tự động</h3>
          <p>Đề xuất hành động tiếp theo, nhắc nhở ngân sách và yêu cầu xác nhận.</p>
        </article>
      </div>
      <div className="home__nlp-preview">
        <div className="home__nlp-preview-card shadow-lg">
          <div>
            <p className="eyebrow">Ví dụ</p>
            <h3>"Cafe với khách hàng 180k chiều nay"</h3>
          </div>
          <ul>
            <li>
              <ReceiptIcon size={18} />
              <span>
                <strong>Danh mục</strong>
                Ăn uống & tiếp khách
              </span>
            </li>
            <li>
              <BrainIcon size={18} />
              <span>
                <strong>Gợi ý</strong>
                Ghi vào ví công ty, thêm ghi chú dự án A1
              </span>
            </li>
          </ul>
          <p className="home__nlp-confirm">Bước xác nhận cho phép bạn chỉnh sửa trước khi lưu.</p>
        </div>
      </div>
    </section>

    <section className="home__section home__cta home__cta--minimal shadow-glass">
      <div>
        <p className="eyebrow">Sẵn sàng?</p>
        <h2>Tham gia MoneyWave ngay hôm nay</h2>
        <p>Tạo tài khoản miễn phí, mời đội nhóm và bắt đầu quản lý chi tiêu thông minh.</p>
      </div>
      <div className="home__actions">
        <Link className="button" to="/register">
          Dùng thử miễn phí
        </Link>
        <Link className="button button--ghost" to="/login">
          Đăng nhập
        </Link>
      </div>
    </section>
  </div>
);

export default HomePage;
