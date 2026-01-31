import { useState } from 'react'
import { useRouter } from 'next/router'

export default function LoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      })
      const data = await res.json()
      if (res.ok) {
        if (typeof window !== 'undefined') {
          localStorage.setItem('token', data.token)
          try { localStorage.setItem('user', JSON.stringify(data.user || { username: username })) } catch(e){}
        }
        router.push('/')
      } else {
        setError(data.error || 'Login failed')
      }
    } catch (err) {
      setError('Network error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[radial-gradient(circle_at_10%_20%,_rgba(255,255,255,0.02),_transparent),_radial-gradient(circle_at_80%_80%,_rgba(255,255,255,0.02),_transparent)]">
      <div className="w-full max-w-md p-8 bg-white/5 rounded-2xl border border-white/10 shadow-md">
        <h1 className="text-2xl font-semibold mb-4">Developer Login</h1>
        <p className="text-sm text-[#9CA3AF] mb-4">Dev-only credentials: <span className="font-medium">admin</span> / <span className="font-medium">password</span></p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-[#9CA3AF] mb-1">Username</label>
            <input value={username} onChange={e => setUsername(e.target.value)} className="w-full px-3 py-2 rounded-md bg-white/5 border border-white/5" />
          </div>
          <div>
            <label className="block text-sm text-[#9CA3AF] mb-1">Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full px-3 py-2 rounded-md bg-white/5 border border-white/5" />
          </div>

          {error && <div className="text-sm text-red-400">{error}</div>}

          <div className="flex items-center justify-between">
            <button disabled={loading} className="px-4 py-2 rounded-md bg-primary text-white disabled:opacity-50">
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
