"use client"

import { useEffect, useState } from 'react'
import ChallengeCard from './ChallengeCard'

type Challenge = { id: string; title: string; bounty: number; skills?: string[] }

export default function ChallengeList(){
  const [list, setList] = useState<Challenge[]>([])
  const [loading, setLoading] = useState(false)
  const [token, setToken] = useState<string | null>(null)
  const [user, setUser] = useState<{ username: string } | null>(null)

  useEffect(()=>{
    if (typeof window === 'undefined') return
    const t = localStorage.getItem('token')
    const u = localStorage.getItem('user')
    setToken(t)
    setUser(u ? JSON.parse(u) : null)
  },[])

  useEffect(()=>{
    if(!token) return
    setLoading(true)
    fetch('/api/challenges', { headers: { Authorization: `Bearer ${token}` } })
      .then(r=>r.json()).then(data=>{
        if(Array.isArray(data)) setList(data)
      }).catch(()=>setList([]))
      .finally(()=>setLoading(false))
  },[token])

  function logout(){
    if (typeof window !== 'undefined'){
      localStorage.removeItem('token')
      localStorage.removeItem('user')
    }
    setToken(null)
    setUser(null)
    setList([])
  }

  if(!token) return (
    <div className="text-sm text-[#9CA3AF]">
      Please <a href="/login" className="text-primary underline">login</a> to view challenges.
    </div>
  )

  if(loading) return <div className="text-sm text-[#9CA3AF]">Loading...</div>

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <div className="text-sm text-[#9CA3AF]">Logged in as <span className="font-medium">{user?.username || 'admin'}</span></div>
        <button onClick={logout} className="text-sm text-red-400">Log out</button>
      </div>

      {list.length === 0 ? (
        <div className="text-sm text-[#9CA3AF]">No challenges yet</div>
      ) : (
        <div className="grid gap-3">
          {list.map(ch => (
            <ChallengeCard key={ch.id} id={ch.id} title={ch.title} bounty={ch.bounty} skills={ch.skills} />
          ))}
        </div>
      )}
    </div>
  )
}