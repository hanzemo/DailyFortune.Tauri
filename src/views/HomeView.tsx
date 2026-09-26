import { useEffect, useState } from 'react';
import { useAuth } from '../stores/auth';
import { useFortune } from '../stores/fortune';
import { countdownText } from '../api/datetime';
import { drawLocally, getFortuneColor } from '../utils/fortune';

export default function HomeView() {
  const { user, isAuth, nextDrawAt } = useAuth();
  const { draw, localFortune, setLocal } = useFortune();
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  // 未登录：本地抽签
  useEffect(() => {
    if (!isAuth && !localFortune) {
      setLocal(drawLocally());
    }
  }, [isAuth, localFortune, setLocal]);

  const fortune = isAuth ? user?.todays_fortune : localFortune;
  const hasDrawn = isAuth ? !!user?.has_drawn_today : !!localFortune;
  const bg = fortune ? getFortuneColor(fortune) : '#2b2b2b';
  const light = fortune === '諭吉' || fortune === '吉' || fortune === '中吉';

  async function onDraw() {
    if (!isAuth) {
      setLocal(drawLocally());
      return;
    }
    setErr('');
    setBusy(true);
    try {
      await draw(); // draw 内部已经 refreshMe，无需再手动调
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : '抽签失败');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={{ maxWidth: 600, margin: '0 auto' }}>
      <div
        className="fortune-card"
        style={{ background: bg, color: light ? '#000' : '#fff' }}
      >
        {fortune ? (
          <>
            <div style={{ fontSize: 16, opacity: 0.85, marginBottom: 8 }}>今日运势</div>
            <div className="fortune-big">{fortune}</div>
          </>
        ) : (
          <div style={{ fontSize: 20, padding: '40px 0' }}>今天还没抽签</div>
        )}
      </div>

      {isAuth && !hasDrawn && (
        <button
          onClick={onDraw}
          disabled={busy}
          style={{ width: '100%', padding: 14, fontSize: 16 }}
        >
          {busy ? '抽签中...' : '抽签'}
        </button>
      )}

      {isAuth && hasDrawn && nextDrawAt && (
        <div className="countdown">{countdownText(nextDrawAt)}</div>
      )}

      {isAuth && hasDrawn && (
        <div className="countdown" style={{ marginTop: 4, opacity: 0.6 }}>
          已连续签到 {user?.streak ?? 0} 天 · 累计 {user?.total_draws ?? 0} 次
        </div>
      )}

      {!isAuth && (
        <>
          <button
            onClick={onDraw}
            style={{ width: '100%', padding: 14, fontSize: 16, marginTop: 12 }}
          >
            重新抽一次（本地）
          </button>
          <div className="countdown" style={{ marginTop: 16 }}>
            登录后可保存你的运势记录
          </div>
        </>
      )}

      {err && <div className="error">{err}</div>}
    </div>
  );
}
