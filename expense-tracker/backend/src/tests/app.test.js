const request = require('supertest');
const app = require('../app');

describe('Health endpoints', () => {
  it('returns OK for /health', async () => {
    const response = await request(app).get('/health');

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({ status: 'UP' });
  });

  it('returns welcome message on root path', async () => {
    const response = await request(app).get('/');

    expect(response.status).toBe(200);
    expect(response.body?.message).toContain('Welcome to the Expense Tracker API');
  });
});
