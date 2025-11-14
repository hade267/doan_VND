const dayjs = require('dayjs');
const { getNlpConfig } = require('./nlpConfig');

const removeDiacritics = (text = '') =>
  text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D');

const normalizeText = (text = '') => removeDiacritics(text).toLowerCase();

const sanitizeForMatch = (text = '') =>
  normalizeText(text)
    .replace(/[^a-z0-9\s/:-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const escapeRegex = (value = '') => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const keywordMatches = (normalizedText, keyword) => {
  const normalizedKeyword = sanitizeForMatch(keyword);
  if (!normalizedKeyword) {
    return false;
  }
  if (normalizedKeyword.includes(' ')) {
    return normalizedText.includes(normalizedKeyword);
  }
  const pattern = new RegExp(`(^|\\s)${escapeRegex(normalizedKeyword)}(\\s|$)`);
  return pattern.test(normalizedText);
};

const computeAverageConfidence = (values = []) => {
  if (!values.length) return 0;
  const sum = values.reduce((acc, value) => acc + Number(value || 0), 0);
  return Math.max(0, Math.min(1, sum / values.length));
};

const amountRegexes = [
  /(?:khoang|gan|hon)?\s*(\d+(?:[.,]\d+)?)(?:\s*)(trieu|tr|m|nghin|ngan|k|dong|d|vnd)?/gi,
  /(\d{1,3}(?:[.,]\d{3})+)(?:\s*)(dong|d|vnd)?/gi,
  /(\d+(?:[.,]\d+)?)(?=\s?vnd|\s?dong|\s?d\b)/gi,
];

const AMOUNT_MULTIPLIERS = {
  trieu: 1_000_000,
  tr: 1_000_000,
  m: 1_000_000,
  nghin: 1_000,
  ngan: 1_000,
  ngàn: 1_000,
  k: 1_000,
  dong: 1,
  d: 1,
  vnd: 1,
};

const normalizeAmountValue = (value = '') => {
  const sanitized = value.replace(/\./g, '').replace(',', '.');
  return Number.parseFloat(sanitized);
};

const extractAmount = (text) => {
  const normalized = normalizeText(text);
  for (const regex of amountRegexes) {
    regex.lastIndex = 0; // reset global regex state before each exec
    const match = regex.exec(normalized);
    if (!match) continue;
    const rawNumber = match[1];
    const unit = match[2] || '';
    const baseValue = normalizeAmountValue(rawNumber);
    if (Number.isNaN(baseValue) || baseValue <= 0) {
      continue;
    }
    const multiplier = AMOUNT_MULTIPLIERS[unit] || 1;
    const amount = baseValue * multiplier;
    const confidence = Math.min(
      1,
      0.6 + (unit ? 0.25 : 0) + (rawNumber.includes(',') || rawNumber.includes('.') ? 0.05 : 0),
    );
    return { amount, confidence };
  }
  return { amount: 0, confidence: 0 };
};

const extractCategory = (text, categories = []) => {
  const normalized = sanitizeForMatch(text);
  let bestMatch = {
    name: 'Khac',
    type: 'expense',
    confidence: 0.1,
  };

  categories.forEach((category) => {
    const keywords = category.keywords || [];
    const hits = keywords.filter((keyword) => keywordMatches(normalized, keyword));
    if (!hits.length) {
      return;
    }
    const precisionBoost = hits.some((kw) => kw.includes(' ')) ? 0.1 : 0;
    const confidence = Math.min(1, 0.4 + hits.length * 0.2 + precisionBoost);
    if (confidence > bestMatch.confidence) {
      bestMatch = {
        name: category.name,
        type: category.type || 'expense',
        confidence,
        icon: category.icon,
        color: category.color,
      };
    }
  });

  return bestMatch;
};

const TYPE_HINTS = {
  income: ['thu ve', 'nhan duoc', 'cong no', 'thu tien', 'tien vao', 'ban duoc'],
  expense: ['chi ra', 'chi phi', 'tra tien', 'mua', 'dat coc', 'dong tien'],
};

const detectType = (text, config, categoryGuess) => {
  const normalized = sanitizeForMatch(text);
  const incomeHits = (config.incomeKeywords || []).filter((keyword) =>
    normalized.includes(sanitizeForMatch(keyword)),
  );
  const expenseHits = (config.expenseKeywords || []).filter((keyword) =>
    normalized.includes(sanitizeForMatch(keyword)),
  );

  let type = 'expense';
  let confidence = 0.25;

  if (incomeHits.length || expenseHits.length) {
    if (incomeHits.length >= expenseHits.length) {
      type = 'income';
      confidence = Math.min(1, 0.4 + incomeHits.length * 0.2);
    } else {
      type = 'expense';
      confidence = Math.min(1, 0.4 + expenseHits.length * 0.2);
    }
  }

  TYPE_HINTS.income.forEach((hint) => {
    if (normalized.includes(hint)) {
      type = 'income';
      confidence = Math.max(confidence, 0.65);
    }
  });
  TYPE_HINTS.expense.forEach((hint) => {
    if (normalized.includes(hint)) {
      type = 'expense';
      confidence = Math.max(confidence, 0.65);
    }
  });

  if (categoryGuess?.confidence >= 0.4) {
    type = categoryGuess.type || type;
    confidence = Math.max(confidence, Math.min(1, 0.6 + categoryGuess.confidence / 2));
  }

  return { type, confidence };
};

const relativeDateKeywords = [
  { keywords: ['hom nay', 'today'], days: 0, confidence: 0.7 },
  { keywords: ['hom qua', 'toi qua', 'toi hom qua'], days: -1, confidence: 0.65 },
  { keywords: ['hom kia'], days: -2, confidence: 0.6 },
  { keywords: ['ngay mai', 'mai'], days: 1, confidence: 0.55 },
  { keywords: ['tuan truoc'], days: -7, confidence: 0.5 },
  { keywords: ['tuan nay', 'this week'], days: 0, confidence: 0.45 },
  { keywords: ['thang truoc'], days: -30, confidence: 0.45 },
  { keywords: ['thang nay'], days: 0, confidence: 0.4 },
  { keywords: ['nam truoc'], days: -365, confidence: 0.4 },
];

const explicitDateRegex = /(?:ngay\s*)?(\d{1,2})[\/\-](\d{1,2})(?:[\/\-](\d{2,4}))?/;

const clampYear = (year) => {
  if (year < 100) {
    return 2000 + year;
  }
  return year;
};

const extractDate = (text) => {
  const normalized = normalizeText(text);
  const today = dayjs();

  const explicitMatch = normalized.match(explicitDateRegex);
  if (explicitMatch) {
    const [, rawDay, rawMonth, rawYear] = explicitMatch;
    const day = Number(rawDay);
    const month = Number(rawMonth);
    const year = rawYear ? clampYear(Number(rawYear)) : today.year();
    if (day >= 1 && day <= 31 && month >= 1 && month <= 12) {
      let resolved = dayjs().year(year).month(month - 1).date(day);
      if (!rawYear && resolved.isAfter(today.add(2, 'month'))) {
        resolved = resolved.subtract(1, 'year');
      }
      return { value: resolved.format('YYYY-MM-DD'), confidence: 0.9 };
    }
  }

  const keywordText = sanitizeForMatch(normalized);
  for (const rule of relativeDateKeywords) {
    if (rule.keywords.some((keyword) => keywordText.includes(keyword))) {
      const resolved = today.add(rule.days, 'day');
      return { value: resolved.format('YYYY-MM-DD'), confidence: rule.confidence };
    }
  }

  return { value: today.format('YYYY-MM-DD'), confidence: 0.35 };
};

const parseNaturalLanguage = (text = '') => {
  const config = getNlpConfig();
  const trimmedText = text.trim();
  const categoryGuess = extractCategory(trimmedText, config.categories || []);
  const typeData = detectType(trimmedText, config, categoryGuess);
  const amountData = extractAmount(trimmedText);
  const dateData = extractDate(trimmedText);

  return {
    type: typeData.type,
    amount: amountData.amount,
    category: categoryGuess.name,
    date: dateData.value,
    description: trimmedText,
    confidence: {
      type: typeData.confidence,
      amount: amountData.confidence,
      category: categoryGuess.confidence,
      date: dateData.confidence,
    },
    metadata: {
      categoryType: categoryGuess.type,
      avgConfidence: computeAverageConfidence([
        typeData.confidence,
        amountData.confidence,
        categoryGuess.confidence,
        dateData.confidence,
      ]),
    },
  };
};

module.exports = { parseNaturalLanguage };
