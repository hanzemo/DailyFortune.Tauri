import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useProfile } from '../stores/profile';
import { useAuth } from '../stores/auth';
import { formatDateOnly, parseBackendDate } from '../api/datetime';
import { getDisplayAvatarUrl, getFortuneColor, getHeatmapColor } from '../utils/fortune';

export default function ProfileView() {
  const { username = '' } = useParams<{ username: string }>();
  const { other, history, loading, loadUser } = useProfile();
  const { user } = useAuth();
  const isSelf = user?.username === username;
  const profile = isSelf ? user : other;

  useEffect(() => {
    if (!username) return;
    if (isSelf) return; // 自己用 auth store 里的数据
    loadUser(username);
  }, [username, isSelf]);

  if (loading) return <div className="countdown">加载中...</div>;
  if (!profile) return <div className="countdown">用户不存在</div>;

  const avatar = getDisplayAvatarUrl(profile);
  const fortuneColor = profile.todays_fortune ? getFortuneColor(profile.todays_fortune) : '#2b2b2b';

  return (
    <div style={{ maxWidth: 720, margin: '0 auto' }}>
      {profile.background_url && (
        <img src={profile.background_url} className="banner" alt="" />
      )}
      <div className="card" style={{ marginTop: 16 }}>
        <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
          {avatar ? (
            <img src={avatar} className="avatar" alt="" />
          ) : (
            <div className="avatar" />
          )}
          <div style={{ flex: 1 }}>
            <h2 style={{ marginBottom: 4 }}>
              {profile.display_name || profile.username}
              {profile.tags?.map(t => (
                <span key={t} className="tag" style={{ marginLeft: 8 }}>{t}</span>
              ))}
            </h2>
            <div style={{ color: 'var(--muted)', fontSize: 13 }}>
              @{profile.username}
              {profile.status !== 'active' && (
                <span style={{ color: '#ff6b6b', marginLeft: 8 }}>
                  [{profile.status}]
                </span>
              )}
            </div>
            {profile.bio && (
              <div style={{ marginTop: 8, color: 'var(--muted)' }}>{profile.bio}</div>
            )}
          </div>
          <div
            style={{
              background: fortuneColor,
              color: '#fff',
              padding: '12px 20px',
              borderRadius: 8,
              textAlign: 'center',
              minWidth: 80,
            }}
          >
            <div style={{ fontSize: 11, opacity: 0.8 }}>今日</div>
            <div style={{ fontSize: 20, fontWeight: 600 }}>
              {profile.todays_fortune ?? '--'}
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <h2>统计</h2>
        <div className="grid">
          <Stat label="累计抽签" value={profile.total_draws} />
          <Stat label="连续天数" value={profile.streak ?? 0} />
          <Stat label="注册时间" value={formatDateOnly(parseBackendDate(profile.registration_date))} />
          <Stat label="最后活跃" value={formatDateOnly(parseBackendDate(profile.last_active_date))} />
        </div>
      </div>

      {profile.fortune_counts && (
        <div className="card">
          <h2>运势分布</h2>
          <div className="grid">
            {Object.entries(profile.fortune_counts).map(([k, v]) => (
              <div
                key={k}
                style={{
                  padding: '12px 16px',
                  borderRadius: 8,
                  background: getFortuneColor(k),
                  color: '#fff',
                  display: 'flex',
                  justifyContent: 'space-between',
                }}
              >
                <span>{k}</span>
                <span style={{ fontWeight: 600 }}>{v}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {history.length > 0 && (
        <div className="card">
          <h2>运势热力图</h2>
          <div className="heatmap">
            {history.map((h, i) => (
              <div
                key={i}
                className="heatmap-cell"
                style={{ background: getHeatmapColor(h.value) || 'var(--border)' }}
                title={`${formatDateOnly(parseBackendDate(h.created_at))} ${h.value}`}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div style={{ background: 'var(--bg)', padding: '12px 16px', borderRadius: 8 }}>
      <div style={{ color: 'var(--muted)', fontSize: 12, marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 18, fontWeight: 600 }}>{value}</div>
    </div>
  );
}
