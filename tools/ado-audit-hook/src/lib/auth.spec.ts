import { isAuthorised } from './auth';

const basic = (user: string, pass: string) =>
  `Basic ${Buffer.from(`${user}:${pass}`).toString('base64')}`;

describe('isAuthorised', () => {
  it('accepts a matching Basic-auth password with any username', () => {
    expect(isAuthorised(basic('ado', 's3cret'), 's3cret')).toBe(true);
    expect(isAuthorised(basic('', 's3cret'), 's3cret')).toBe(true);
  });

  it('rejects wrong or missing credentials and unset secret', () => {
    expect(isAuthorised(basic('ado', 'nope'), 's3cret')).toBe(false);
    expect(isAuthorised(undefined, 's3cret')).toBe(false);
    expect(isAuthorised('Bearer abc', 's3cret')).toBe(false);
    expect(isAuthorised(basic('ado', 's3cret'), undefined)).toBe(false);
  });
});
