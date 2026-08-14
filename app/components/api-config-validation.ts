// app/components/api-config-validation.ts v2.8.2

// 输入验证和清理函数相关类型与常量

export interface ApiConfigItem {
  id: string;
  name: string;
  provider: string;
  url: string;
}

export interface ValidatedApiConfigItem extends ApiConfigItem {
  isValid: boolean;
}

const MAX_INPUT_LENGTH = 100;
const MAX_URL_LENGTH = 200;

/** 白名单策略清理用户输入，防止注入危险字符 */
export function sanitizeInput(input: string): string {
  return input
    .replace(/[^a-zA-Z0-9\s\-_\.\/:@?#&=+~,()[\]{}|%]/g, '')
    .trim()
    .slice(0, MAX_INPUT_LENGTH);
}

/** 验证 URL 必须为 https 且包含有效主机名 */
export function validateUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'https:' && parsed.hostname.includes('.');
  } catch {
    return false;
  }
}

/** 批量校验 API 配置并返回每项有效性标记 */
export function validateApiConfig(config: ApiConfigItem[]): ValidatedApiConfigItem[] {
  return config.map((api) => ({
    ...api,
    isValid: validateUrl(api.url) && api.name.length > 0 && api.provider.length > 0,
  }));
}

export { MAX_URL_LENGTH };
