require('dotenv').config();
const app = require('./app');
const { testConnection } = require('./config/database');
const { syncModels } = require('./models');

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  await testConnection();
  await syncModels();

  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
};

startServer();
