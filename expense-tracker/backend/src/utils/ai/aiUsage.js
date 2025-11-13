const { Op } = require('sequelize');
const { NlpLog } = require('../../models');

const getDailyLimit = () => parseInt(process.env.NLP_AI_DAILY_LIMIT || '0', 10);

const getTodayRange = () => {
  const now = new Date();
  const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  const end = new Date(start);
  end.setUTCDate(end.getUTCDate() + 1);
  return [start, end];
};

const enforceDailyAiLimit = async (userId) => {
  const limit = getDailyLimit();
  if (!limit || limit <= 0) {
    return;
  }

  const [start, end] = getTodayRange();
  const usageCount = await NlpLog.count({
    where: {
      user_id: userId,
      engine: 'gemini',
      created_at: {
        [Op.gte]: start,
        [Op.lt]: end,
      },
    },
  });

  if (usageCount >= limit) {
    const error = new Error('AI daily quota exceeded.');
    error.statusCode = 429;
    throw error;
  }
};

module.exports = {
  enforceDailyAiLimit,
};
