const normalizeText = (text) =>
  text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();

const incomeKeywords = ['luong', 'thu nhap', 'nhan', 'thuong', 'ban duoc'];
const expenseKeywords = [
  'chi',
  'mua',
  'tra',
  'dong',
  'mat',
  'het',
  'an',
  'uong',
  'xang',
  'choi',
];

const categoryMap = {
  an: 'An uong',
  uong: 'An uong',
  com: 'An uong',
  quan: 'An uong',
  cafe: 'An uong',
  xang: 'Di lai',
  xe: 'Di lai',
  grab: 'Di lai',
  taxi: 'Di lai',
  bus: 'Di lai',
  mua: 'Mua sam',
  ao: 'Mua sam',
  giay: 'Mua sam',
  sieu: 'Mua sam',
  nha: 'Nha cua',
  dien: 'Nha cua',
  nuoc: 'Nha cua',
  internet: 'Nha cua',
  hoc: 'Hoc tap',
  sach: 'Hoc tap',
  hocphi: 'Hoc tap',
  thu: 'Thu nhap khac',
  kiem: 'Thu nhap khac',
};

const detectType = (text) => {
  if (incomeKeywords.some((keyword) => text.includes(keyword))) {
    return 'income';
  }
  if (expenseKeywords.some((keyword) => text.includes(keyword))) {
    return 'expense';
  }
  return 'expense';
};

const extractAmount = (text) => {
  const amountMatch = text.match(/(\d+[.,]?\d*)\s*(trieu|nghin|ngan|k)?/);
  if (!amountMatch) {
    return 0;
  }

  const numeric = parseFloat(amountMatch[1].replace(',', '.'));
  const unit = amountMatch[2] || '';

  if (unit.includes('trieu')) {
    return numeric * 1_000_000;
  }
  if (unit.includes('nghin') || unit.includes('ngan') || unit === 'k') {
    return numeric * 1_000;
  }
  return numeric;
};

const extractCategory = (text) => {
  for (const [keyword, categoryName] of Object.entries(categoryMap)) {
    if (text.includes(keyword)) {
      return categoryName;
    }
  }
  return 'Khac';
};

const extractDate = (text) => {
  const today = new Date();
  const normalized = new Date(today);

  if (text.includes('hom qua')) {
    normalized.setDate(today.getDate() - 1);
  } else if (text.includes('hom kia')) {
    normalized.setDate(today.getDate() - 2);
  } else if (text.includes('tu hom qua')) {
    normalized.setDate(today.getDate() - 1);
  }

  return normalized;
};

const parseNaturalLanguage = (text) => {
  const normalized = normalizeText(text || '');
  const type = detectType(normalized);
  const amount = extractAmount(normalized);
  const category = extractCategory(normalized);
  const date = extractDate(normalized);

  return {
    type,
    amount,
    category,
    date: date.toISOString().split('T')[0],
    description: text.trim(),
  };
};

module.exports = { parseNaturalLanguage };
