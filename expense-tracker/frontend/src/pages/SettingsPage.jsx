import React, { useState } from 'react';

const sections = [
  {
    title: 'Chủ đề',
    description: 'Chuyển đổi giữa chế độ sáng và tối, tùy chỉnh màu nhấn.',
  },
  {
    title: 'Thông báo',
    description: 'Bật tắt email nhắc chi tiêu, báo cáo tuần và cảnh báo vượt ngân sách.',
  },
  {
    title: 'Trí tuệ nhân tạo',
    description: 'Quản lý hạn mức AI hằng ngày, chọn engine ưu tiên và xem lịch sử sử dụng.',
  },
];

const SettingsPage = () => {
  const [language, setLanguage] = useState('vi');
  const [currency, setCurrency] = useState('VND');

  return (
    <div className="dashboard">
      <div className="dashboard__header">
        <div>
          <div className="pill">Cài đặt</div>
          <h1>Tùy chỉnh trải nghiệm</h1>
          <p>Điều chỉnh ngôn ngữ, tiền tệ và hành vi thông báo phù hợp với bạn.</p>
        </div>
      </div>

      <div className="card">
        <h2>Cơ bản</h2>
        <div className="settings-grid">
          <div>
            <label>Ngôn ngữ hiển thị</label>
            <select value={language} onChange={(e) => setLanguage(e.target.value)}>
              <option value="vi">Tiếng Việt</option>
              <option value="en">English</option>
            </select>
          </div>
          <div>
            <label>Tiền tệ mặc định</label>
            <select value={currency} onChange={(e) => setCurrency(e.target.value)}>
              <option value="VND">VND - Việt Nam</option>
              <option value="USD">USD - Đô la Mỹ</option>
            </select>
          </div>
        </div>
      </div>

      <div className="card">
        <h2>Mục nâng cao</h2>
        <div className="settings-list">
          {sections.map((section) => (
            <div key={section.title} className="settings-item">
              <div>
                <strong>{section.title}</strong>
                <p>{section.description}</p>
              </div>
              <button className="button button--ghost">Cấu hình</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
