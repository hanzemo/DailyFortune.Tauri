/**
 * 后端返回的日期是北京时间字面值，无时区标记。
 * 例："2026-09-27T00:00:00" 实际是北京 0 点 = UTC 前一天 16 点。
 *
 * 处理规则：
 * - 无时区（长度 19，第 10 位是 'T'）→ 直接按 +08:00 解析
 * - 带 Z 或 ±HH:MM → 标准解析
 */
export function parseBackendDate(s: string | null | undefined): Date | null {
  if (!s) return null;
  const t = s.trim();

  // 无时区：2026-09-27T00:00:00 正好 19 字符
  if (t.length === 19 && t[10] === 'T') {
    const d = new Date(t + '+08:00');
    return isNaN(d.getTime()) ? null : d;
  }

  const d = new Date(t);
  return isNaN(d.getTime()) ? null : d;
}

export const formatLocal = (d: Date | null): string =>
  d
    ? d.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      })
    : '--';

export const formatDateOnly = (d: Date | null): string =>
  d
    ? d.toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      })
    : '--';

export function countdownText(next: string | null): string {
  const d = parseBackendDate(next);
  if (!d) return '';
  const diff = d.getTime() - Date.now();
  if (diff <= 0) return '';
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  return h > 0 ? `${h} 小时 ${m} 分钟后可抽签` : `${m} 分钟后可抽签`;
}
