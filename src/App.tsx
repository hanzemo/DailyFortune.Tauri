import { useEffect } from 'react';
import { Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from './stores/auth';
import { getFortuneColor } from './utils/fortune';
import LoginView from './views/LoginView';
import HomeView from './views/HomeView';
import LeaderboardView from './views/LeaderboardView';
import ProfileView from './views/ProfileView';
import SettingsView from './views/SettingsView';
import AdminView from './views/AdminView';

function Nav() {
  const { user, isAuth, logout } = useAuth();
  const loc = useLocation();
  const bg = user?.todays_fortune ? getFortuneColor(user.todays_fortune) : '#2b2b2b';

  // 未登录：显示品牌 + 登录入口
  if (!isAuth || !user) {
    return (
      <nav className="nav" style={{ background: bg }}>
        <div className="nav-brand">DailyFortune</div>
        <div className="nav-items" style={{ flex: 1 }} />
        <Link
          to="/login"
          style={{
            color: '#fff',
            textDecoration: 'none',
            padding: '6px 16px',
            background: 'rgba(255,255,255,.2)',
            borderRadius: 8,
          }}
        >
          登录 / 注册
        </Link>
      </nav>
    );
  }

  const items = [
    { to: '/', t: '主页' },
    { to: '/leaderboard', t: '排行榜' },
    { to: `/profile/${user.username}`, t: '资料' },
    { to: '/settings', t: '设置' },
  ];
  if (user.role === 'admin') items.push({ to: '/admin', t: '管理' });

  return (
    <nav className="nav" style={{ background: bg }}>
      <div className="nav-brand">DailyFortune</div>
      <div className="nav-items">
        {items.map(i => (
          <Link
            key={i.to}
            to={i.to}
            className={
              loc.pathname === i.to || loc.pathname.startsWith(i.to + '/')
                ? 'active'
                : ''
            }
          >
            {i.t}
          </Link>
        ))}
      </div>
      <button onClick={logout}>退出</button>
    </nav>
  );
}

export default function App() {
  const { init, isAuth, loading, user } = useAuth();

  useEffect(() => {
    init();
  }, [init]);

  if (loading) return <div className="loading">加载中...</div>;

  return (
    <div className="app">
      <Nav />
      <main className="main">
        <Routes>
          <Route path="/login" element={isAuth ? <Navigate to="/" replace /> : <LoginView />} />
          <Route path="/" element={<HomeView />} />
          <Route path="/leaderboard" element={<LeaderboardView />} />
          <Route path="/profile/:username" element={<ProfileView />} />
          <Route
            path="/settings"
            element={isAuth ? <SettingsView /> : <Navigate to="/login" replace />}
          />
          <Route
            path="/admin"
            element={
              isAuth && user?.role === 'admin'
                ? <AdminView />
                : <Navigate to="/" replace />
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}
