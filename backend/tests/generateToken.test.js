const { generateAccessToken } = require('../utils/generateToken');

describe('generateToken util', () => {
  beforeAll(() => {
    process.env.JWT_SECRET = 'testsecret';
    process.env.JWT_EXPIRE = '1h';
  });

  test('generates an access token string', () => {
    const token = generateAccessToken('12345', 'User');
    expect(typeof token).toBe('string');
    expect(token.length).toBeGreaterThan(0);
  });
});
