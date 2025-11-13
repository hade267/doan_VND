import React, { useEffect, useMemo, useState } from 'react';
import {
  fetchCategories,
  createCategory,
  deleteCategory,
} from '../services/categoryService';
import {
  fetchBudgets,
  createBudget,
  deleteBudget,
} from '../services/budgetService';

const sections = [
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
  const [categories, setCategories] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState({ categories: false, budgets: false });
  const [formMessage, setFormMessage] = useState('');
  const [categoryForm, setCategoryForm] = useState({
    name: '',
    type: 'expense',
    icon: '',
    color: '#1ec58f',
  });
  const [budgetForm, setBudgetForm] = useState({
    category_id: '',
    amount_limit: '',
    period: 'monthly',
    start_date: new Date().toISOString().slice(0, 10),
  });
  const loadCategories = async () => {
    setLoading((prev) => ({ ...prev, categories: true }));
    try {
      const data = await fetchCategories();
      setCategories(data);
    } catch (error) {
      setFormMessage(error.response?.data?.message || 'Không thể tải danh mục.');
    } finally {
      setLoading((prev) => ({ ...prev, categories: false }));
    }
  };

  const loadBudgets = async () => {
    setLoading((prev) => ({ ...prev, budgets: true }));
    try {
      const data = await fetchBudgets();
      setBudgets(data);
    } catch (error) {
      setFormMessage(error.response?.data?.message || 'Không thể tải ngân sách.');
    } finally {
      setLoading((prev) => ({ ...prev, budgets: false }));
    }
  };


  useEffect(() => {
    loadCategories();
    loadBudgets();
  }, []);

  const expenseCategories = useMemo(
    () => categories.filter((item) => item.type === 'expense'),
    [categories]
  );

  const handleCategorySubmit = async (e) => {
    e.preventDefault();
    setFormMessage('');
    if (!categoryForm.name.trim()) {
      setFormMessage('Vui lòng nhập tên danh mục.');
      return;
    }
    try {
      await createCategory(categoryForm);
      setCategoryForm({
        name: '',
        type: categoryForm.type,
        icon: '',
        color: categoryForm.color,
      });
      await loadCategories();
      setFormMessage('Đã thêm danh mục mới.');
    } catch (error) {
      setFormMessage(error.response?.data?.message || 'Không thể tạo danh mục.');
    }
  };

  const handleDeleteCategory = async (id) => {
    if (!window.confirm('Bạn có chắc muốn xóa danh mục này?')) return;
    try {
      await deleteCategory(id);
      await loadCategories();
      setFormMessage('Đã xóa danh mục.');
    } catch (error) {
      setFormMessage(error.response?.data?.message || 'Không thể xóa danh mục.');
    }
  };

  const handleBudgetSubmit = async (e) => {
    e.preventDefault();
    setFormMessage('');
    if (!budgetForm.category_id || !Number(budgetForm.amount_limit)) {
      setFormMessage('Vui lòng chọn danh mục và nhập hạn mức hợp lệ.');
      return;
    }
    try {
      await createBudget(budgetForm);
      setBudgetForm({
        category_id: '',
        amount_limit: '',
        period: budgetForm.period,
        start_date: new Date().toISOString().slice(0, 10),
      });
      await loadBudgets();
      setFormMessage('Đã tạo ngân sách.');
    } catch (error) {
      setFormMessage(error.response?.data?.message || 'Không thể tạo ngân sách.');
    }
  };

  const handleDeleteBudget = async (id) => {
    if (!window.confirm('Xóa ngân sách này?')) return;
    try {
      await deleteBudget(id);
      await loadBudgets();
      setFormMessage('Đã xóa ngân sách.');
    } catch (error) {
      setFormMessage(error.response?.data?.message || 'Không thể xóa ngân sách.');
    }
  };

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

      <div className="settings-columns">
        <div className="card">
          <h2>Danh mục</h2>
          <p>Quản lý danh mục thu nhập/chi tiêu để NLP hiểu chính xác hơn.</p>
          <form className="settings-form" onSubmit={handleCategorySubmit}>
            <div className="settings-grid">
              <div>
                <label>Tên danh mục</label>
                <input
                  value={categoryForm.name}
                  onChange={(e) => setCategoryForm((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="Ví dụ: Ăn uống"
                  required
                />
              </div>
              <div>
                <label>Loại</label>
                <select
                  value={categoryForm.type}
                  onChange={(e) => setCategoryForm((prev) => ({ ...prev, type: e.target.value }))}
                >
                  <option value="expense">Chi tiêu</option>
                  <option value="income">Thu nhập</option>
                </select>
              </div>
              <div>
                <label>Biểu tượng</label>
                <input
                  value={categoryForm.icon}
                  onChange={(e) => setCategoryForm((prev) => ({ ...prev, icon: e.target.value }))}
                  placeholder="Ví dụ: 🍜"
                />
              </div>
              <div>
                <label>Màu sắc</label>
                <input
                  type="color"
                  value={categoryForm.color}
                  onChange={(e) => setCategoryForm((prev) => ({ ...prev, color: e.target.value }))}
                />
              </div>
            </div>
            <button className="button" type="submit" disabled={loading.categories}>
              {loading.categories ? 'Đang lưu...' : 'Thêm danh mục'}
            </button>
          </form>
          <div className="settings-list">
            {loading.categories && !categories.length && <p>Đang tải danh mục...</p>}
            {categories.map((category) => (
              <div key={category.id} className="settings-item">
                <div>
                  <strong>
                    {category.icon && <span className="settings-icon">{category.icon}</span>}
                    {category.name}
                  </strong>
                  <p>
                    Loại: {category.type === 'expense' ? 'Chi tiêu' : 'Thu nhập'} • Màu:{' '}
                    <span style={{ color: category.color }}>{category.color}</span>
                  </p>
                </div>
                {!category.is_default && (
                  <button className="button button--ghost" type="button" onClick={() => handleDeleteCategory(category.id)}>
                    Xóa
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <h2>Ngân sách</h2>
          <p>Đặt hạn mức cho từng danh mục chi tiêu và theo dõi tiến độ.</p>
          <form className="settings-form" onSubmit={handleBudgetSubmit}>
            <div className="settings-grid">
              <div>
                <label>Danh mục chi tiêu</label>
                <select
                  value={budgetForm.category_id}
                  onChange={(e) => setBudgetForm((prev) => ({ ...prev, category_id: e.target.value }))}
                >
                  <option value="">Chọn danh mục</option>
                  {expenseCategories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label>Hạn mức (VND)</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={budgetForm.amount_limit}
                  onChange={(e) => setBudgetForm((prev) => ({ ...prev, amount_limit: e.target.value }))}
                  placeholder="Ví dụ: 5000000"
                />
              </div>
              <div>
                <label>Chu kỳ</label>
                <select
                  value={budgetForm.period}
                  onChange={(e) => setBudgetForm((prev) => ({ ...prev, period: e.target.value }))}
                >
                  <option value="monthly">Tháng</option>
                  <option value="weekly">Tuần</option>
                  <option value="daily">Ngày</option>
                  <option value="yearly">Năm</option>
                </select>
              </div>
              <div>
                <label>Ngày bắt đầu</label>
                <input
                  type="date"
                  value={budgetForm.start_date}
                  onChange={(e) => setBudgetForm((prev) => ({ ...prev, start_date: e.target.value }))}
                />
              </div>
            </div>
            <button className="button" type="submit" disabled={loading.budgets || !expenseCategories.length}>
              {loading.budgets ? 'Đang lưu...' : 'Thêm ngân sách'}
            </button>
            {!expenseCategories.length && (
              <p className="settings-hint">Cần tạo ít nhất 1 danh mục chi tiêu trước khi đặt ngân sách.</p>
            )}
          </form>

          <div className="settings-list">
            {loading.budgets && !budgets.length && <p>Đang tải ngân sách...</p>}
            {budgets.map((budget) => {
              const usage = budget.usage || {};
              const percent = Math.min(usage.percentage || 0, 999);
              const categoryName = budget.Category?.name || 'Danh mục đã xóa';
              return (
                <div key={budget.id} className="settings-item">
                  <div className="budget-summary">
                    <strong>{categoryName}</strong>
                    <p>
                      Hạn mức:{' '}
                      {Number(usage.limit || budget.amount_limit).toLocaleString('vi-VN', {
                        style: 'currency',
                        currency: 'VND',
                      })}
                    </p>
                    <div className="usage-row">
                      <span>Đã dùng:</span>
                      <strong>
                        {Number(usage.spent || 0).toLocaleString('vi-VN', {
                          style: 'currency',
                          currency: 'VND',
                        })}
                      </strong>
                    </div>
                    <div className="usage-bar">
                      <div
                        className={`usage-bar__fill ${percent >= 100 ? 'is-danger' : percent >= 85 ? 'is-warning' : ''}`}
                        style={{ width: `${Math.min(percent, 100)}%` }}
                      />
                    </div>
                    <small>
                      Chu kỳ: {budget.period} • {new Date(usage.window?.start || budget.start_date).toLocaleDateString()} -{' '}
                      {new Date(usage.window?.end || budget.end_date).toLocaleDateString()}
                    </small>
                  </div>
                  <button className="button button--ghost" type="button" onClick={() => handleDeleteBudget(budget.id)}>
                    Xóa
                  </button>
                </div>
              );
            })}
            {!budgets.length && !loading.budgets && <p>Chưa có ngân sách nào, hãy bắt đầu tạo mới.</p>}
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

      {formMessage && <p className="settings-message">{formMessage}</p>}
    </div>
  );
};

export default SettingsPage;
