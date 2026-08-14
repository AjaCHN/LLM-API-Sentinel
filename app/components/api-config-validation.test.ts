// app/components/api-config-validation.test.ts v2.8.2
import {
  sanitizeInput,
  validateUrl,
  validateApiConfig,
  MAX_URL_LENGTH,
} from './api-config-validation';

describe('sanitizeInput', () => {
  it('removes dangerous characters outside whitelist', () => {
    // 白名单仅保留字母数字和少数符号, < > 被替换为 / (白名单内)
    expect(sanitizeInput('<script>alert(1)</script>')).toBe('scriptalert(1)/script');
  });

  it('keeps safe characters including url fragments', () => {
    expect(sanitizeInput('My-API_1 https://a.b')).toBe('My-API_1 https://a.b');
  });

  it('trims and truncates beyond MAX_INPUT_LENGTH', () => {
    const long = 'a'.repeat(250);
    const result = sanitizeInput(long);
    expect(result.length).toBeLessThanOrEqual(100);
    expect(result).toBe('a'.repeat(100));
  });
});

describe('validateUrl', () => {
  it('accepts valid https urls', () => {
    expect(validateUrl('https://api.openai.com/v1')).toBe(true);
  });

  it('rejects http urls', () => {
    expect(validateUrl('http://api.openai.com')).toBe(false);
  });

  it('rejects urls without a dot in hostname', () => {
    expect(validateUrl('https://localhost')).toBe(false);
  });

  it('rejects invalid urls', () => {
    expect(validateUrl('not-a-url')).toBe(false);
  });
});

describe('validateApiConfig', () => {
  it('marks config with valid https url and names as valid', () => {
    const result = validateApiConfig([
      { id: '1', name: 'OpenAI', provider: 'OpenAI', url: 'https://api.openai.com' },
    ]);
    expect(result[0].isValid).toBe(true);
  });

  it('marks config with invalid url as invalid', () => {
    const result = validateApiConfig([
      { id: '2', name: 'Bad', provider: 'Bad', url: 'ftp://nope' },
    ]);
    expect(result[0].isValid).toBe(false);
  });

  it('marks config with empty name/provider as invalid', () => {
    const result = validateApiConfig([
      { id: '3', name: '', provider: 'X', url: 'https://a.b' },
    ]);
    expect(result[0].isValid).toBe(false);
  });
});

describe('MAX_URL_LENGTH', () => {
  it('is exported as 200', () => {
    expect(MAX_URL_LENGTH).toBe(200);
  });
});
