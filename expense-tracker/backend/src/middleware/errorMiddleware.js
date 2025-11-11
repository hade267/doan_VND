const errorHandler = (err, req, res, next) => {
  // Ghi lại lỗi ra console để debug
  console.error(err.stack);

  // Trả về một phản hồi 500 (Internal Server Error) chung
  // để tránh rò rỉ chi tiết lỗi cho người dùng
  res.status(500).json({
    message: 'Đã xảy ra lỗi máy chủ. Vui lòng thử lại sau.',
  });
};

module.exports = errorHandler;