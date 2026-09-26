import { useEffect, useState } from 'react';
import { api } from '../api/client';
import { useAuth } from '../stores/auth';

export default function LoginView() {
  const { login } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [regOpen, setRegOpen] = useState(true);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api
      .getRegistrationStatus()
      .then(r => setRegOpen(r.is_open))
      .catch(() => setRegOpen(false));
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr('');
    setMsg('');
    setBusy(true);
    try {
      if (isRegister) {
        if (!regOpen) throw new Error('注册已关闭');
        const r = await api.register(username, email, password);
        if (r.access_token) {
          // 后端注册即登录
          await login(username, password);
        } else {
          // 后端只返回用户，需手动登录
          setIsRegister(false);
          setMsg('注册成功，请登录');
        }
      } else {
        await login(username, password);
      }
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : '操作失败');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={{ maxWidth: 380, margin: '80px auto' }}>
      <div className="card">
        <h2 style={{ textAlign: 'center', marginBottom: 24 }}>
          {isRegister ? '注册 DailyFortune' : '登录 DailyFortune'}
        </h2>
        <form onSubmit={submit}>
          <div style={{ marginBottom: 12 }}>
            <label className="label">用户名</label>
            <input
              value={username}
              onChange={e => setUsername(e.target.value)}
              required
              autoFocus
            />
          </div>
          {isRegister && (
            <div style={{ marginBottom: 12 }}>
              <label className="label">邮箱</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
            </div>
          )}
          <div style={{ marginBottom: 16 }}>
            <label className="label">密码</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" disabled={busy} style={{ width: '100%' }}>
            {busy ? '请稍候...' : isRegister ? '注册' : '登录'}
          </button>
        </form>
        {msg && <div style={{ color: '#4caf50', marginTop: 8 }}>{msg}</div>}
        {err && <div className="error">{err}</div>}
        <div style={{ textAlign: 'center', marginTop: 16 }}>
          <button
            className="secondary"
            onClick={() => {
              setIsRegister(!isRegister);
              setErr('');
              setMsg('');
            }}
          >
            {isRegister ? '已有账号？去登录' : '没有账号？去注册'}
          </button>
        </div>
      </div>
    </div>
  );
}
