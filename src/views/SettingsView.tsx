import { useState } from 'react';
import { useAuth } from '../stores/auth';
import { api } from '../api/client';
import { TIMEZONES } from '../utils/fortune';
import type { UserUpdatePayload } from '../api/types';

export default function SettingsView() {
  const { user, setUser, logout } = useAuth();
  const [tab, setTab] = useState<'profile' | 'password' | 'danger'>('profile');
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');

  if (!user) return null;

  return (
    <div style={{ maxWidth: 600, margin: '0 auto' }}>
      <div className="card">
        <h2>设置</h2>
        <div className="tabs">
          <button className={tab === 'profile' ? 'active' : ''} onClick={() => setTab('profile')}>资料</button>
          <button className={tab === 'password' ? 'active' : ''} onClick={() => setTab('password')}>密码</button>
          <button className={tab === 'danger' ? 'active' : ''} onClick={() => setTab('danger')}>危险操作</button>
        </div>

        {tab === 'profile' && (
          <ProfileForm
            onSaved={u => { setUser(u); setMsg('已保存'); setErr(''); }}
            onError={e => { setErr(e); setMsg(''); }}
          />
        )}
        {tab === 'password' && <PasswordForm onOk={() => { setMsg('密码已修改'); setErr(''); }} onErr={setErr} />}
        {tab === 'danger' && (
          <DangerZone
            onDeleted={async () => { await logout(); }}
            onErr={setErr}
          />
        )}

        {msg && <div style={{ color: '#4caf50', marginTop: 12 }}>{msg}</div>}
        {err && <div className="error">{err}</div>}
      </div>
    </div>
  );
}

function ProfileForm({ onSaved, onError }: {
  onSaved: (u: ReturnType<typeof useAuth.getState>['user']) => void;
  onError: (e: string) => void;
}) {
  const { user } = useAuth();
  const [form, setForm] = useState<UserUpdatePayload>({
    display_name: user?.display_name ?? '',
    email: user?.email ?? '',
    bio: user?.bio ?? '',
    avatar_url: user?.avatar_url ?? '',
    background_url: user?.background_url ?? '',
    language: user?.language ?? 'zh-CN',
    timezone: user?.timezone ?? 'Asia/Shanghai',
    qq: user?.qq ?? null,
    use_qq_avatar: user?.use_qq_avatar ?? false,
  });
  const [busy, setBusy] = useState(false);

  function upd<K extends keyof UserUpdatePayload>(k: K, v: UserUpdatePayload[K]) {
    setForm(f => ({ ...f, [k]: v }));
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      const r = await api.updateMyProfile(form);
      onSaved(r.user);
    } catch (e: unknown) {
      onError(e instanceof Error ? e.message : '保存失败');
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={save}>
      <Field label="显示名">
        <input value={form.display_name ?? ''} onChange={e => upd('display_name', e.target.value)} />
      </Field>
      <Field label="邮箱">
        <input type="email" value={form.email ?? ''} onChange={e => upd('email', e.target.value)} />
      </Field>
      <Field label="简介">
        <textarea rows={2} value={form.bio ?? ''} onChange={e => upd('bio', e.target.value)} />
      </Field>
      <Field label="头像 URL">
        <input value={form.avatar_url ?? ''} onChange={e => upd('avatar_url', e.target.value)} />
      </Field>
      <Field label="背景图 URL">
        <input value={form.background_url ?? ''} onChange={e => upd('background_url', e.target.value)} />
      </Field>
      <div className="row">
        <div>
          <label className="label">QQ 号</label>
          <input
            type="number"
            value={form.qq ?? ''}
            onChange={e => upd('qq', e.target.value ? Number(e.target.value) : null)}
          />
        </div>
        <div>
          <label className="label">使用 QQ 头像</label>
          <select
            value={form.use_qq_avatar ? 'yes' : 'no'}
            onChange={e => upd('use_qq_avatar', e.target.value === 'yes')}
          >
            <option value="no">否</option>
            <option value="yes">是</option>
          </select>
        </div>
      </div>
      <Field label="时区">
        <select value={form.timezone ?? ''} onChange={e => upd('timezone', e.target.value)}>
          {TIMEZONES.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
      </Field>
      <button type="submit" disabled={busy}>{busy ? '保存中...' : '保存'}</button>
    </form>
  );
}

function PasswordForm({ onOk, onErr }: { onOk: () => void; onErr: (e: string) => void }) {
  const [cur, setCur] = useState('');
  const [nw, setNw] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      await api.changePassword(cur, nw);
      setCur(''); setNw('');
      onOk();
    } catch (e: unknown) {
      onErr(e instanceof Error ? e.message : '修改失败');
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit}>
      <Field label="当前密码">
        <input type="password" value={cur} onChange={e => setCur(e.target.value)} required />
      </Field>
      <Field label="新密码">
        <input type="password" value={nw} onChange={e => setNw(e.target.value)} required />
      </Field>
      <button type="submit" disabled={busy}>修改密码</button>
    </form>
  );
}

function DangerZone({ onDeleted, onErr }: { onDeleted: () => void; onErr: (e: string) => void }) {
  const [confirm, setConfirm] = useState('');
  const [busy, setBusy] = useState(false);

  async function del() {
    if (confirm !== 'DELETE') return;
    setBusy(true);
    try {
      await api.deleteMyAccount();
      onDeleted();
    } catch (e: unknown) {
      onErr(e instanceof Error ? e.message : '删除失败');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <p style={{ color: 'var(--muted)', marginBottom: 12 }}>
        注销账号将永久删除你的所有数据，无法恢复。输入 <code>DELETE</code> 确认。
      </p>
      <Field label="确认">
        <input value={confirm} onChange={e => setConfirm(e.target.value)} />
      </Field>
      <button className="danger" disabled={confirm !== 'DELETE' || busy} onClick={del}>
        {busy ? '删除中...' : '永久注销账号'}
      </button>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <label className="label">{label}</label>
      {children}
    </div>
  );
}
