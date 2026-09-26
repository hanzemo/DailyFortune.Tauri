import { useEffect, useState } from 'react';
import { api, ApiError } from '../api/client';
import type { UserMeProfile } from '../api/types';

export default function AdminView() {
  const [users, setUsers] = useState<UserMeProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');
  const [editing, setEditing] = useState<UserMeProfile | null>(null);

  async function load() {
    setLoading(true);
    setErr('');
    try {
      const r = await api.adminGetAllUsers();
      setUsers(r as UserMeProfile[]);
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : '加载失败');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function wrap<T>(fn: () => Promise<T>, after?: () => void) {
    try {
      await fn();
      after?.();
    } catch (e: unknown) {
      const msg = e instanceof ApiError ? e.message : '操作失败';
      setErr(msg);
    }
  }

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto' }}>
      <div className="card">
        <h2>用户管理（{users.length}）</h2>
        {loading && <div className="countdown">加载中...</div>}
        {err && <div className="error">{err}</div>}
        {!loading && (
          <table>
            <thead>
              <tr>
                <th>用户名</th>
                <th>显示名</th>
                <th>角色</th>
                <th>状态</th>
                <th>抽签</th>
                <th>标签</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id}>
                  <td>@{u.username}</td>
                  <td>{u.display_name}</td>
                  <td>
                    <span className="tag">{u.role}</span>
                  </td>
                  <td>
                    <span style={{ color: u.status === 'active' ? '#4caf50' : '#ff6b6b' }}>
                      {u.status}
                    </span>
                    {u.is_hidden && <span style={{ marginLeft: 6, color: 'var(--muted)' }}>[隐]</span>}
                  </td>
                  <td>{u.total_draws}</td>
                  <td>{u.tags?.join(', ') || '-'}</td>
                  <td>
                    <button className="secondary" onClick={() => setEditing(u)}>编辑</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {editing && (
        <EditModal
          user={editing}
          onClose={() => setEditing(null)}
          onChanged={load}
        />
      )}
    </div>
  );
}

function EditModal({ user, onClose, onChanged }: {
  user: UserMeProfile;
  onClose: () => void;
  onChanged: () => void;
}) {
  const [role, setRole] = useState(user.role);
  const [status, setStatus] = useState(user.status);
  const [hidden, setHidden] = useState(user.is_hidden);
  const [tags, setTags] = useState((user.tags ?? []).join(','));
  const [newPw, setNewPw] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  async function run(fn: () => Promise<void>) {
    setBusy(true);
    setErr('');
    try {
      await fn();
      onChanged();
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : '操作失败');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="modal-bg" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <h2 style={{ marginBottom: 16 }}>
          编辑 @{user.username}
        </h2>

        <label className="label">角色</label>
        <div className="row">
          <select value={role} onChange={e => setRole(e.target.value)}>
            <option value="user">user</option>
            <option value="admin">admin</option>
          </select>
          <button
            className="secondary"
            disabled={busy || role === user.role}
            onClick={() => run(() => api.adminUpdateRole(user.id, role))}
          >
            应用角色
          </button>
        </div>

        <label className="label">状态</label>
        <div className="row">
          <select value={status} onChange={e => setStatus(e.target.value)}>
            <option value="active">active</option>
            <option value="disabled">disabled</option>
          </select>
          <button
            className="secondary"
            disabled={busy || status === user.status}
            onClick={() => run(() => api.adminUpdateStatus(user.id, status))}
          >
            应用状态
          </button>
        </div>

        <label className="label">隐藏用户</label>
        <div className="row">
          <select value={hidden ? '1' : '0'} onChange={e => setHidden(e.target.value === '1')}>
            <option value="0">公开</option>
            <option value="1">隐藏</option>
          </select>
          <button
            className="secondary"
            disabled={busy || hidden === user.is_hidden}
            onClick={() => run(() => api.adminUpdateVisibility(user.id, hidden))}
          >
            应用可见性
          </button>
        </div>

        <label className="label">标签（逗号分隔）</label>
        <div className="row">
          <input value={tags} onChange={e => setTags(e.target.value)} placeholder="tag1,tag2" />
          <button
            className="secondary"
            disabled={busy}
            onClick={() => run(() => api.adminUpdateTags(
              user.id,
              tags.split(',').map(s => s.trim()).filter(Boolean)
            ))}
          >
            应用标签
          </button>
        </div>

        <label className="label">重置密码</label>
        <div className="row">
          <input
            type="text"
            value={newPw}
            onChange={e => setNewPw(e.target.value)}
            placeholder="新密码（明文）"
          />
          <button
            className="secondary"
            disabled={busy || !newPw}
            onClick={() => run(async () => {
              await api.adminResetPassword(user.id, newPw);
              setNewPw('');
            })}
          >
            重置
          </button>
        </div>

        {err && <div className="error">{err}</div>}

        <div style={{ marginTop: 20, display: 'flex', gap: 8, justifyContent: 'space-between' }}>
          <button
            className="danger"
            disabled={busy}
            onClick={() => {
              if (confirm(`确认删除 @${user.username}？此操作不可恢复`)) {
                run(() => api.adminDeleteUser(user.id)).then(onClose);
              }
            }}
          >
            删除用户
          </button>
          <button className="secondary" onClick={onClose}>关闭</button>
        </div>
      </div>
    </div>
  );
}
