// app/lib/share-content.ts v2.10.4
import { tArray } from './i18n';

/** 随机选取一条宣传文案（promos 数组，索引随机） */
function getRandomPromo(): string {
  const promos = tArray('share.promos');
  if (promos.length > 0) {
    const idx = Math.floor(Math.random() * promos.length);
    return promos[idx] ?? '';
  }
  return '';
}

/** 构建带 ref 参数的分析分享链接 */
export function buildShareUrl(): string {
  if (typeof window === 'undefined') return '';
  const url = new URL(window.location.href);
  url.searchParams.set('ref', 'share');
  return url.toString();
}

/** 组装最终分享文本：分享链接 + 换行 + 随机宣传文案 */
export function buildShareText(): string {
  const url = buildShareUrl();
  const promo = getRandomPromo();
  return promo ? `${url}\n${promo}` : url;
}
