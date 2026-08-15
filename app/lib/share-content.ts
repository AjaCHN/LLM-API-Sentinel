// app/lib/share-content.ts v2.9.7
// 分享功能文案工具: 复制分析链接时附带一条随机项目宣传文案
// 文案以 share.promo1..share.promoN 形式存放于 i18n，运行时随机挑选序号

/** 宣传文案条数（en / zh-cn / zh-tw 均提供该数量条） */
export const PROMO_COUNT = 5;

/** 当前 URL 查询参数是否已经包含分享来源标记 */
export function buildShareUrl(): string {
  if (typeof window === 'undefined') return '';
  const url = new URL(window.location.href);
  // 标记分享来源，便于统计（幂等：重复添加不重复）
  url.searchParams.set('ref', 'share');
  return url.toString();
}

/** 从 share.promo1..share.promoN 中随机抽取一条文案 */
export function getRandomPromo(t: (key: string) => string): string {
  const n = Math.floor(Math.random() * PROMO_COUNT) + 1;
  // 未翻译的文案会回退到 en 同序号，仍然可用
  return t(`share.promo${n}`);
}

/** 组装分享文本: 分析链接 + 换行 + 随机宣传文案 */
export function buildShareText(t: (key: string) => string): string {
  const url = buildShareUrl();
  const promo = getRandomPromo(t);
  return `${url}\n${promo}`;
}
