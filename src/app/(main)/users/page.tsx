'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Edit, Trash2, Save, X, User, Shield, Key, Eye, EyeOff } from 'lucide-react'
import { formatDate } from '@/lib/utils'

interface UserData {
  id: number
  username: string
  name: string
  role: string
  createdAt: string
}

interface CurrentUser {
  id: number
  name: string
  role: string
}

export default function UsersPage() {
  const router = useRouter()
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null)
  const [users, setUsers] = useState<UserData[]>([])
  const [loading, setLoading] = useState(true)

  // 新增用户表单
  const [showAdd, setShowAdd] = useState(false)
  const [newUser, setNewUser] = useState({ username: '', password: '', name: '', role: 'doctor' })
  const [adding, setAdding] = useState(false)
  const [error, setError] = useState('')

  // 编辑用户
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editForm, setEditForm] = useState({ username: '', name: '', role: '' })
  const [saving, setSaving] = useState(false)

  // 修改密码
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [passwordForm, setPasswordForm] = useState({ oldPassword: '', newPassword: '', confirmPassword: '', targetUserId: 0, targetUserName: '' })
  const [changingPwd, setChangingPwd] = useState(false)
  const [pwdError, setPwdError] = useState('')
  const [pwdSuccess, setPwdSuccess] = useState('')
  const [showOldPwd, setShowOldPwd] = useState(false)
  const [showNewPwd, setShowNewPwd] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    setLoading(true)
    const [authRes, usersRes] = await Promise.all([
      fetch('/api/auth'),
      fetch('/api/users'),
    ])
    const authData = await authRes.json()
    if (authData.user) setCurrentUser(authData.user)

    if (usersRes.ok) {
      const usersData = await usersRes.json()
      setUsers(usersData.users)
    }
    setLoading(false)
  }

  // ===== 新增用户 =====
  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (!newUser.username || !newUser.password || !newUser.name) {
      setError('请填写所有必填字段')
      return
    }
    if (newUser.password.length < 4) {
      setError('密码至少4位')
      return
    }
    setAdding(true)
    const res = await fetch('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newUser),
    })
    if (res.ok) {
      setShowAdd(false)
      setNewUser({ username: '', password: '', name: '', role: 'doctor' })
      loadData()
    } else {
      const data = await res.json()
      setError(data.error || '创建失败')
    }
    setAdding(false)
  }

  // ===== 编辑用户 =====
  function startEdit(u: UserData) {
    setEditingId(u.id)
    setEditForm({ username: u.username, name: u.name, role: u.role })
  }

  async function saveEdit() {
    if (!editingId) return
    setSaving(true)
    await fetch(`/api/users/${editingId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editForm),
    })
    setEditingId(null)
    setSaving(false)
    loadData()
  }

  // ===== 删除用户 =====
  async function handleDelete(u: UserData) {
    if (!confirm(`确定删除用户「${u.name}(${u.username})」吗？此操作不可撤销。`)) return
    const res = await fetch(`/api/users/${u.id}`, { method: 'DELETE' })
    if (res.ok) {
      loadData()
    } else {
      const data = await res.json()
      alert(data.error || '删除失败')
    }
  }

  // ===== 修改密码 =====
  function openChangePassword(target?: UserData) {
    setPwdError('')
    setPwdSuccess('')
    if (target && currentUser?.role === 'admin') {
      // 管理员重置他人密码
      setPasswordForm({ oldPassword: '', newPassword: '', confirmPassword: '', targetUserId: target.id, targetUserName: target.name })
    } else {
      // 修改自己的密码
      setPasswordForm({ oldPassword: '', newPassword: '', confirmPassword: '', targetUserId: 0, targetUserName: '' })
    }
    setShowPasswordModal(true)
  }

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault()
    setPwdError('')
    setPwdSuccess('')

    if (passwordForm.newPassword.length < 4) {
      setPwdError('新密码至少4位')
      return
    }
    if (!passwordForm.targetUserId && !passwordForm.oldPassword) {
      setPwdError('请输入旧密码')
      return
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPwdError('两次输入的新密码不一致')
      return
    }

    setChangingPwd(true)
    const body: Record<string, string | number> = { newPassword: passwordForm.newPassword }
    if (passwordForm.targetUserId) {
      body.targetUserId = passwordForm.targetUserId
    } else {
      body.oldPassword = passwordForm.oldPassword
    }

    const res = await fetch('/api/users/change-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    const data = await res.json()
    if (res.ok) {
      setPwdSuccess(data.message || '密码修改成功')
      setTimeout(() => setShowPasswordModal(false), 1500)
    } else {
      setPwdError(data.error || '修改失败')
    }
    setChangingPwd(false)
  }

  const roleLabels: Record<string, string> = { admin: '管理员', doctor: '医生', receptionist: '前台' }
  const roleColors: Record<string, string> = { admin: 'bg-red-100 text-red-700', doctor: 'bg-blue-100 text-blue-700', receptionist: 'bg-green-100 text-green-700' }

  if (loading) return <div className="flex items-center justify-center py-20 text-gray-400">加载中...</div>

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">用户管理</h1>
        {currentUser?.role === 'admin' && (
          <button onClick={() => { setShowAdd(true); setError('') }}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">
            <Plus className="w-4 h-4" /> 添加账号
          </button>
        )}
      </div>

      {/* 当前登录用户信息卡片 */}
      <div className="bg-white rounded-xl border p-6">
        <h3 className="text-base font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <User className="w-5 h-5 text-blue-600" /> 我的账号
        </h3>
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center">
            <User className="w-7 h-7 text-blue-600" />
          </div>
          <div className="flex-1">
            <p className="text-lg font-semibold text-gray-800">{currentUser?.name}</p>
            <p className="text-sm text-gray-500">
              {currentUser?.role === 'admin' ? '管理员' : currentUser?.role === 'doctor' ? '医生' : '前台'}
            </p>
          </div>
          <button onClick={() => openChangePassword()}
            className="flex items-center gap-2 px-4 py-2 border rounded-lg text-sm hover:bg-gray-50">
            <Key className="w-4 h-4" /> 修改密码
          </button>
        </div>
      </div>

      {/* 新增用户表单 */}
      {showAdd && (
        <form onSubmit={handleAdd} className="bg-white rounded-xl border border-blue-200 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-gray-800">添加新账号</h3>
            <button type="button" onClick={() => setShowAdd(false)}><X className="w-5 h-5" /></button>
          </div>
          {error && <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700">用户名 *</label>
              <input value={newUser.username} onChange={e => setNewUser(p => ({ ...p, username: e.target.value }))}
                placeholder="登录用户名" className="mt-1 w-full px-3 py-2 border rounded-lg text-sm" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">密码 *</label>
              <input type="password" value={newUser.password} onChange={e => setNewUser(p => ({ ...p, password: e.target.value }))}
                placeholder="至少4位" className="mt-1 w-full px-3 py-2 border rounded-lg text-sm" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">姓名 *</label>
              <input value={newUser.name} onChange={e => setNewUser(p => ({ ...p, name: e.target.value }))}
                placeholder="真实姓名" className="mt-1 w-full px-3 py-2 border rounded-lg text-sm" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">角色</label>
              <select value={newUser.role} onChange={e => setNewUser(p => ({ ...p, role: e.target.value }))}
                className="mt-1 w-full px-3 py-2 border rounded-lg text-sm">
                <option value="doctor">医生</option>
                <option value="receptionist">前台</option>
                <option value="admin">管理员</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <button type="button" onClick={() => setShowAdd(false)} className="px-4 py-2 text-sm border rounded-lg">取消</button>
            <button type="submit" disabled={adding} className="flex items-center gap-2 px-4 py-2 text-sm bg-blue-600 text-white rounded-lg disabled:opacity-50">
              <Save className="w-4 h-4" /> {adding ? '创建中...' : '创建账号'}
            </button>
          </div>
        </form>
      )}

      {/* 用户列表（仅管理员可见） */}
      {currentUser?.role === 'admin' && (
        <div className="bg-white rounded-xl border overflow-hidden">
          <div className="px-5 py-3 border-b bg-gray-50">
            <h3 className="text-base font-semibold text-gray-800 flex items-center gap-2">
              <Shield className="w-5 h-5 text-orange-500" /> 所有账号 ({users.length})
            </h3>
          </div>
          <div className="divide-y">
            {users.length === 0 ? (
              <div className="px-5 py-8 text-center text-gray-400">暂无其他账号</div>
            ) : (
              users.map(u => (
                <div key={u.id} className="px-5 py-4 hover:bg-gray-50">
                  {editingId === u.id ? (
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <User className="w-5 h-5 text-gray-500" />
                      </div>
                      <div className="flex-1 grid grid-cols-3 gap-3">
                        <input value={editForm.username} onChange={e => setEditForm(p => ({ ...p, username: e.target.value }))} placeholder="用户名" className="px-3 py-1.5 border rounded text-sm" />
                        <input value={editForm.name} onChange={e => setEditForm(p => ({ ...p, name: e.target.value }))} placeholder="姓名" className="px-3 py-1.5 border rounded text-sm" />
                        <select value={editForm.role} onChange={e => setEditForm(p => ({ ...p, role: e.target.value }))} className="px-3 py-1.5 border rounded text-sm">
                          <option value="admin">管理员</option>
                          <option value="doctor">医生</option>
                          <option value="receptionist">前台</option>
                        </select>
                      </div>
                      <div className="flex items-center gap-1">
                        <button onClick={saveEdit} disabled={saving} className="p-1.5 text-green-600 hover:bg-green-50 rounded"><Save className="w-4 h-4" /></button>
                        <button onClick={() => setEditingId(null)} className="p-1.5 text-gray-400 hover:bg-gray-100 rounded"><X className="w-4 h-4" /></button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${u.id === currentUser?.id ? 'bg-blue-100' : 'bg-gray-100'}`}>
                          <User className={`w-5 h-5 ${u.id === currentUser?.id ? 'text-blue-600' : 'text-gray-500'}`} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-gray-800">{u.name}</span>
                            {u.id === currentUser?.id && <span className="text-xs px-1.5 py-0.5 rounded bg-blue-100 text-blue-600">我</span>}
                            <span className={`text-xs px-2 py-0.5 rounded-full ${roleColors[u.role] || 'bg-gray-100'}`}>{roleLabels[u.role] || u.role}</span>
                          </div>
                          <p className="text-xs text-gray-400">@{u.username} · 创建于 {formatDate(u.createdAt)}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <button onClick={() => startEdit(u)} className="p-1.5 text-gray-400 hover:text-blue-600 rounded" title="编辑"><Edit className="w-4 h-4" /></button>
                        <button onClick={() => openChangePassword(u)} className="p-1.5 text-gray-400 hover:text-orange-600 rounded" title="重置密码"><Key className="w-4 h-4" /></button>
                        {u.id !== currentUser?.id && (
                          <button onClick={() => handleDelete(u)} className="p-1.5 text-gray-400 hover:text-red-600 rounded" title="删除"><Trash2 className="w-4 h-4" /></button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* 修改密码弹窗 */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center" onClick={() => setShowPasswordModal(false)}>
          <form onSubmit={handleChangePassword} className="bg-white rounded-xl w-full max-w-md mx-4 p-6 space-y-4" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">
                {passwordForm.targetUserId ? `重置密码 - ${passwordForm.targetUserName}` : '修改密码'}
              </h2>
              <button type="button" onClick={() => setShowPasswordModal(false)}><X className="w-5 h-5" /></button>
            </div>

            {pwdError && <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{pwdError}</p>}
            {pwdSuccess && <p className="text-sm text-green-600 bg-green-50 px-3 py-2 rounded-lg">{pwdSuccess}</p>}

            {/* 自己的密码需要输入旧密码 */}
            {!passwordForm.targetUserId && (
              <div>
                <label className="text-sm font-medium text-gray-700">旧密码</label>
                <div className="relative mt-1">
                  <input type={showOldPwd ? 'text' : 'password'} value={passwordForm.oldPassword}
                    onChange={e => setPasswordForm(p => ({ ...p, oldPassword: e.target.value }))}
                    className="w-full px-3 py-2 pr-10 border rounded-lg text-sm" placeholder="输入当前密码" />
                  <button type="button" onClick={() => setShowOldPwd(!showOldPwd)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400">
                    {showOldPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            )}

            <div>
              <label className="text-sm font-medium text-gray-700">新密码</label>
              <div className="relative mt-1">
                <input type={showNewPwd ? 'text' : 'password'} value={passwordForm.newPassword}
                  onChange={e => setPasswordForm(p => ({ ...p, newPassword: e.target.value }))}
                  className="w-full px-3 py-2 pr-10 border rounded-lg text-sm" placeholder="至少4位" />
                <button type="button" onClick={() => setShowNewPwd(!showNewPwd)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400">
                  {showNewPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">确认新密码</label>
              <input type="password" value={passwordForm.confirmPassword}
                onChange={e => setPasswordForm(p => ({ ...p, confirmPassword: e.target.value }))}
                className="mt-1 w-full px-3 py-2 border rounded-lg text-sm" placeholder="再次输入新密码" />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={() => setShowPasswordModal(false)} className="px-4 py-2 text-sm border rounded-lg">取消</button>
              <button type="submit" disabled={changingPwd}
                className="flex items-center gap-2 px-4 py-2 text-sm bg-blue-600 text-white rounded-lg disabled:opacity-50">
                <Key className="w-4 h-4" /> {changingPwd ? '处理中...' : '确认修改'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
