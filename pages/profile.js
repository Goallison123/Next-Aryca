import { useEffect, useState } from 'react'
import Link from 'next/link'

export default function Profile(){
  const [challenges, setChallenges] = useState([])
  const [payouts, setPayouts] = useState({})

  useEffect(()=>{
    fetch('/api/challenges').then(r=>r.json()).then(list=>{
      setChallenges(list)
      // fetch payouts for finished ones
      list.forEach(async ch => {
        if(ch.status === 'finished'){
          const p = await fetch(`/api/payout/${ch.id}`).then(r=>r.ok? r.json() : null)
          if(p) setPayouts(prev => ({...prev, [ch.id]: p}))
        }
      })
    })
  },[])

  return (
    <div className="app">
      <div className="header">
        <div>
          <h2>Your Profile</h2>
          <div className="small">Earnings, ratings, and recent sessions (prototype view)</div>
        </div>
        <div style={{display:'flex',gap:8}}>
          <Link href="/"><button className="card">Back</button></Link>
        </div>
      </div>

      <div className="grid">
        <div className="card">
          <h3 style={{marginTop:0}}>Challenges</h3>
          {challenges.map(c => (
            <div key={c.id} style={{borderTop:'1px solid rgba(255,255,255,0.03)',paddingTop:8,marginTop:8}}>
              <div style={{display:'flex',justifyContent:'space-between'}}>
                <div>
                  <strong>{c.title}</strong>
                  <div className="small">{c.skills.join(', ')}</div>
                </div>
                <div style={{textAlign:'right'}}>
                  <div>${c.bounty}</div>
                  <div className="small">{c.status}</div>
                </div>
              </div>
              {payouts[c.id] && <div className="small" style={{marginTop:6}}>Payout: {JSON.stringify(payouts[c.id])}</div>}
            </div>
          ))}
        </div>

        <div className="card">
          <h3 style={{marginTop:0}}>Analytics (Prototype)</h3>
          <div className="small">Earnings, streaks, and match quality will be shown here.</div>
        </div>
      </div>
    </div>
  )
}
