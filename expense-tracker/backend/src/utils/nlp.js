const { getNlpConfig } = require('./nlpConfig');

const normalizeText = (text) =>
  text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();

const detectType = (text, incomeKeywords = [], expenseKeywords = []) => {
  const matchedIncome = incomeKeywords.filter((keyword) => text.includes(keyword));
  const matchedExpense = expenseKeywords.filter((keyword) => text.includes(keyword));

  if (matchedIncome.length === 0 && matchedExpense.length === 0) {
    return { type: 'expense', confidence: 0.2 };
  }

  if (matchedIncome.length >= matchedExpense.length) {
    return { type: 'income', confidence: Math.min(1, matchedIncome.length / 3) };
  }

  return { type: 'expense', confidence: Math.min(1, matchedExpense.length / 3) };
};

const amountRegexes = [
  /(\d+[.,]?\d*)\s*(trieu|triệu)/,
  /(\d+[.,]?\d*)\s*(nghin|ngan|ngàn|k)/,
  /(\d+[.,]?\d*)\s*(vnd|đ|d)/,
  /(\d+[.,]?\d*)/,
];

const extractAmount = (text) => {
  for (const regex of amountRegexes) {
    const match = text.match(regex);
    if (match) {
      const numeric = parseFloat(match[1].replace(',', '.'));
      const unit = match[2] || '';

      if (/trieu|triệu/.test(unit)) {
        return { amount: numeric * 1_000_000, confidence: 0.95 };
      }
      if (/nghin|ngan|ngàn|k/.test(unit)) {
        return { amount: numeric * 1_000, confidence: 0.85 };
      }
      if (/vnd|đ|d/.test(unit) || unit === '') {
        return { amount: numeric, confidence: 0.7 };
      }
    }
  }
  return { amount: 0, confidence: 0 };
};

const extractCategory = (text, categories = []) => {
  let bestMatch = { name: 'Khac', confidence: 0 };

  for (const category of categories) {
    const matches = category.keywords?.filter((keyword) => text.includes(keyword)) || [];
    if (matches.length > bestMatch.confidence) {
      bestMatch = {
        name: category.name,
        confidence: Math.min(1, matches.length / 3),
      };
    }
  }

  return bestMatch;
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
  const config = getNlpConfig();
  const normalized = normalizeText(text || '');
  const { type, confidence: typeConfidence } = detectType(
    normalized,
    config.incomeKeywords,
    config.expenseKeywords
  );
  const { amount, confidence: amountConfidence } = extractAmount(normalized);
  const { name: category, confidence: categoryConfidence } = extractCategory(
    normalized,
    config.categories
  );
  const date = extractDate(normalized);

  return {
    type,
    amount,
    category,
    date: date.toISOString().split('T')[0],
    description: text.trim(),
    confidence: {
      type: typeConfidence,
      amount: amountConfidence,
      category: categoryConfidence,
    },
  };
};

module.exports = { parseNaturalLanguage };
