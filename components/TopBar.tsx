"use client"

import Link from 'next/link'
import { useEffect, useState } from 'react'

export default function TopBar(){
  const [user, setUser] = useState<{ username?: string } | null>(null)

  useEffect(()=>{
    if(typeof window === 'undefined') return
    const u = localStorage.getItem('user')
    setUser(u ? JSON.parse(u) : null)
  },[])

  function logout(){
    if(typeof window !== 'undefined'){
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.reload()
    }
  }

  return (
    <header className="w-full bg-transparent px-6 py-4 flex items-center justify-between border-b border-white/6">
      <div className="flex items-center gap-4">
        <Link href="/" className="font-semibold text-lg">Aryca</Link>
      </div>

      <div className="flex items-center gap-4">
        {user ? (
          <>
            <div className="text-sm text-[#9CA3AF]">{user.username}</div>
            <button onClick={logout} className="text-sm text-red-400">Log out</button>
          </>
        ) : (
          <Link href="/login" className="text-sm text-primary">Log in</Link>
        )}
      </div>
    </header>
  )
}
