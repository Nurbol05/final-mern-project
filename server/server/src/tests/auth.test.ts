import jwt from 'jsonwebtoken';

describe('JWT', () => {
  it('creates valid token', () => {
    const token = jwt.sign(
      { userId: '123' },
      'testsecret',
      { expiresIn: '1h' }
    );

    const decoded = jwt.verify(token, 'testsecret') as any;
    expect(decoded.userId).toBe('123');
  });
});
