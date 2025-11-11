```markdown
# Expense Tracker – Ứng Dụng Quản Lý Chi Tiêu Cá Nhân  
**Phiên bản tập trung vào phát triển (Development-Focused) – Không Docker**

![React](https://img.shields.io/badge/Frontend-React%2018-blue)  
![Node.js](https://img.shields.io/badge/Backend-Node.js%20Express-green)  
![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL-blue)  
![NLP](https://img.shields.io/badge/NLP-Custom%20Parser-orange)  

---

## Tổng Quan Dự Án

**Expense Tracker** là một **ứng dụng web full-stack** giúp người dùng:

- Nhập chi tiêu/thu nhập bằng **ngôn ngữ tự nhiên** (VD: *"hôm qua mua xăng 100k"*)  
- Phân tích chi tiêu theo danh mục, thời gian  
- Xem báo cáo trực quan (biểu đồ)  
- Thiết lập ngân sách & cảnh báo vượt mức  

> **Điểm nổi bật**:  
> - NLP đơn giản, dễ mở rộng (rule-based)  
> - Giao diện hiện đại, responsive  
> - Kiến trúc rõ ràng, dễ bảo trì  

---

## Kiến Trúc Ứng Dụng (MERN Stack + NLP)

```
Frontend (React) 
    │
    ▼ HTTPS
Backend (Node.js + Express)
    │
    ▼
Database (PostgreSQL)
    │
    ▼
NLP Parser (Custom Regex + Rule-based)
```

---

## Cấu Trúc Thư Mục

```
expense-tracker/
├── frontend/               # React App
│   ├── public/
│   ├── src/
│   │   ├── components/     # UI Components
│   │   ├── pages/          # Trang: Dashboard, Login, Reports...
│   │   ├── hooks/          # Custom hooks
│   │   ├── services/       # API calls
│   │   ├── utils/nlp.js    # Xử lý ngôn ngữ tự nhiên
│   │   └── App.jsx
│   └── package.json
│
├── backend/                # Node.js API
│   ├── src/
│   │   ├── controllers/    # Xử lý request
│   │   ├── routes/         # API routes
│   │   ├── models/         # Sequelize models
│   │   ├── middleware/     # Auth, validation
│   │   ├── utils/nlp.js    # NLP Parser
│   │   └── config/db.js
│   ├── server.js
│   └── package.json
│
├── .env.example
├── README.md
└── database.sql            # Script tạo DB
```

---

## Tính Năng Chính (Use Cases)

| UC | Tính Năng | Mô Tả |
|----|-----------|-------|
| UC1 | **Đăng nhập / Đăng ký** | JWT + Bcrypt |
| UC2 | **Nhập chi tiêu bằng tiếng Việt** | *"hôm qua ăn sáng 25k"* → tự động phân loại |
| UC3 | **Nhập thu nhập** | *"lương tháng này 15 triệu"* |
| UC4 | **Truy vấn bằng ngôn ngữ** | *"tháng này tiêu bao nhiêu ăn uống?"* |
| UC5 | **Báo cáo trực quan** | Biểu đồ tròn, cột (Chart.js) |
| UC6 | **Quản lý danh mục & ngân sách** | Tự định nghĩa danh mục, đặt giới hạn |
| UC7 | **Admin: Quản lý người dùng & lịch sử NLP** | Xem log, sửa lỗi hiểu sai |

---

## Cơ Sở Dữ Liệu (PostgreSQL)

> **File**: `database.sql`

```sql
-- Tạo database
CREATE DATABASE expense_tracker;

-- Bảng người dùng
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role VARCHAR(20) DEFAULT 'user',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Danh mục (tùy chỉnh theo user)
CREATE TABLE categories (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(50) NOT NULL,
  type VARCHAR(10) CHECK (type IN ('expense', 'income')),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Giao dịch
CREATE TABLE transactions (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id) ON DELETE CASCADE,
  amount DECIMAL(12,2) NOT NULL,
  type VARCHAR(10) CHECK (type IN ('expense', 'income')),
  category_id INT REFERENCES categories(id),
  description TEXT,
  date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Ngân sách
CREATE TABLE budgets (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id) ON DELETE CASCADE,
  category_id INT REFERENCES categories(id),
  amount_limit DECIMAL(12,2) NOT NULL,
  period VARCHAR(10) CHECK (period IN ('weekly', 'monthly', 'yearly')),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Lịch sử NLP (dùng để cải thiện parser)
CREATE TABLE nlp_logs (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id) ON DELETE CASCADE,
  input_text TEXT NOT NULL,
  parsed_json JSONB,
  is_correct BOOLEAN,
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## Xử Lý Ngôn Ngữ Tự Nhiên (NLP Parser) – `backend/src/utils/nlp.js`

```js
const parseNaturalLanguage = (text, userId) => {
  text = text.toLowerCase().trim();

  // 1. Xác định loại: chi tiêu hay thu nhập
  const isIncome = /(lương|nhận|thu nhập|tiền).*(triệu|nghìn|k)/i.test(text);
  const type = isIncome ? 'income' : 'expense';

  // 2. Trích xuất số tiền
  const amountMatch = text.match(/(\d+[.,]?\d*)\s*(triệu|nghìn|k)/);
  let amount = 0;
  if (amountMatch) {
    const num = parseFloat(amountMatch[1].replace(',', '.'));
    const unit = amountMatch[2];
    if (unit.includes('triệu')) amount = num * 1000000;
    else if (unit.includes('nghìn')) amount = num * 1000;
    else amount = num * 1000; // mặc định 'k'
  }

  // 3. Trích xuất danh mục
  const categoryMap = {
    ăn: 'Ăn uống', uống: 'Ăn uống', cơm: 'Ăn uống', quán: 'Ăn uống',
    xăng: 'Đi lại', xe: 'Đi lại', grab: 'Đi lại', tàu: 'Đi lại',
    mua: 'Mua sắm', quần: 'Mua sắm', áo: 'Mua sắm', siêu: 'Mua sắm',
    nhà: 'Nhà cửa', điện: 'Nhà cửa', nước: 'Nhà cửa',
    học: 'Học tập', sách: 'Học tập'
  };
  let categoryName = 'Khác';
  for (const [key, value] of Object.entries(categoryMap)) {
    if (text.includes(key)) {
      categoryName = value;
      break;
    }
  }

  // 4. Trích xuất ngày
  const today = new Date();
  let date = today;
  if (text.includes('hôm qua')) {
    date.setDate(today.getDate() - 1);
  } else if (text.includes('hôm nay')) {
    date = today;
  } else if (text.includes('hôm kia')) {
    date.setDate(today.getDate() - 2);
  }

  return {
    type,
    amount,
    category: categoryName,
    date: date.toISOString().split('T')[0],
    description: text
  };
};

module.exports = { parseNaturalLanguage };
```

---

## API Endpoints (Backend)

| Method | Endpoint | Mô Tả |
|--------|----------|-------|
| `POST` | `/api/auth/login` | Đăng nhập → trả JWT |
| `POST` | `/api/auth/register` | Đăng ký |
| `POST` | `/api/transactions/nlp` | Nhập bằng ngôn ngữ |
| `GET`  | `/api/transactions` | Lấy danh sách |
| `GET`  | `/api/reports/summary` | Báo cáo tổng quan |
| `POST` | `/api/budgets` | Tạo ngân sách |
| `GET`  | `/api/categories` | Lấy danh mục |

---

## Frontend – Trang Dashboard (`frontend/src/pages/Dashboard.jsx`)

```jsx
import { useState } from 'react';
import api from '../services/api';
import TransactionList from '../components/TransactionList';
import ChartSummary from '../components/ChartSummary';

const Dashboard = () => {
  const [input, setInput] = useState('');
  const [transactions, setTransactions] = useState([]);

  const handleSubmit = async () => {
    try {
      const res = await api.post('/transactions/nlp', { text: input });
      setTransactions([res.data, ...transactions]);
      setInput('');
    } catch (err) {
      alert('Lỗi: ' + err.response?.data?.message);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Theo dõi chi tiêu</h1>

      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <textarea
          className="w-full p-3 border rounded-lg"
          rows="3"
          placeholder="VD: hôm qua ăn sáng 25k ở quán cô Ba"
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button
          onClick={handleSubmit}
          className="mt-3 bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
        >
          Ghi lại
        </button>
      </div>

      <TransactionList data={transactions} />
      <ChartSummary />
    </div>
  );
};

export default Dashboard;
```

---

## Cài Đặt & Chạy Dự Án (Local Development)

### Yêu cầu
- Node.js ≥ 18
- PostgreSQL ≥ 14
- npm hoặc yarn

---

### Bước 1: Cài đặt PostgreSQL & Tạo DB

```bash
# Tạo DB
psql -U postgres -f database.sql
```

---

### Bước 2: Cấu hình Backend

```bash
cd backend
cp .env.example .env
```

#### `.env`
```env
PORT=5000
DATABASE_URL=postgresql://postgres:yourpassword@localhost:5432/expense_tracker
JWT_SECRET=your_very_strong_secret_key_here_2025
NODE_ENV=development
```

```bash
npm install
npm run dev
```

---

### Bước 3: Cấu hình Frontend

```bash
cd ../frontend
cp .env.example .env
```

#### `.env`
```env
VITE_API_URL=http://localhost:5000/api
```

```bash
npm install
npm run dev
```

---

### Truy cập
- **Frontend**: `http://localhost:5173`  
- **Backend API**: `http://localhost:5000`  
- **Swagger Docs**: `http://localhost:5000/api-docs` (tùy chọn)

---

## Phát Triển Tính Năng Mới

| Tính năng | Gợi ý triển khai |
|---------|------------------|
| Thêm danh mục | `POST /categories` |
| Cải thiện NLP | Thêm từ khóa vào `categoryMap` |
| Báo cáo nâng cao | Dùng `date-fns` + `recharts` |
| Thông báo vượt ngân sách | Kiểm tra khi thêm giao dịch |

---

## Kiểm Thử

```bash
# Backend
cd backend && npm test

# Frontend
cd frontend && npm run test
```

---

## Góp Sức

1. Fork repo  
2. Tạo branch: `feat/ten-tinh-nang`  
3. Commit rõ ràng: `feat: thêm nhập thu nhập bằng giọng nói`  
4. Mở Pull Request

---

## Tác Giả & Giấy Phép

**Phát triển bởi**: [Tên bạn]  
**Hướng dẫn**: [Tên giảng viên]  
**Thời gian**: 10/11/2025  

**Giấy phép**: MIT

---

**Sẵn sàng phát triển – Code ngay hôm nay!**  
> *"Quản lý tiền bạc bắt đầu từ việc hiểu hành vi chi tiêu."*  

--- 

**Demo local**: `http://localhost:5173`  
**API Docs**: `http://localhost:5000/api-docs`

--- 

**Bắt đầu code nào!**  
