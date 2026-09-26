import { useEffect } from 'react';
import { useFortune } from '../stores/fortune';
import type { LeaderboardPeriod } from '../api/types';
import { getFortuneColor } from '../utils/fortune';

const PERIODS: { key: LeaderboardPeriod; label: string }[] = [
  { key: 'today', label: '今日' },
  { key: 'week',  label: '本周' },
  { key: 'month', label: '本月' },
  { key: 'year',  label: '本年' },
];

export default function LeaderboardView() {
  const { leaderboard, period, loading, load, setPeriod } = useFortune();

  useEffect(() => {
    load('today');
  }, []);

  function switchPeriod(p: LeaderboardPeriod) {
    setPeriod(p);
    load(p);
  }

  return (
    <div style={{ maxWidth: 720, margin: '0 auto' }}>
      <div className="card">
        <h2>排行榜</h2>
        <div className="tabs">
          {PERIODS.map(p => (
            <button
              key={p.key}
              className={period === p.key ? 'active' : ''}
              onClick={() => switchPeriod(p.key)}
            >
              {p.label}
            </button>
          ))}
        </div>

        {loading && <div className="countdown">加载中...</div>}

        {!loading && leaderboard.length === 0 && (
          <div className="countdown">暂无数据</div>
        )}

        {!loading && leaderboard.map(group => (
          <div key={group.fortune} className="lb-group">
            <h3 style={{ borderLeftColor: getFortuneColor(group.fortune) }}>
              {group.fortune}
              <span style={{ marginLeft: 8, fontSize: 12, color: 'var(--muted)' }}>
                {group.users.length} 人
              </span>
            </h3>
            {group.users.length === 0 ? (
              <div className="countdown" style={{ textAlign: 'left', padding: '4px 0' }}>
                无人
              </div>
            ) : (
              group.users.map((u, i) => (
                <div key={u.username} className="lb-user">
                  <span>
                    <span style={{ color: 'var(--muted)', marginRight: 8, display: 'inline-block', width: 24 }}>
                      {i + 1}
                    </span>
                    {u.display_name || u.username}
                  </span>
                  <span style={{ color: 'var(--muted)', fontSize: 12 }}>
                    @{u.username}
                  </span>
                </div>
              ))
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
