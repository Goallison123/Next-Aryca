import Link from 'next/link'
import { useEffect, useState } from 'react'
import ThreePreview from '../components/ThreePreview'

export default function Home(){
  const [challenges, setChallenges] = useState([])
  const [dark, setDark] = useState(true)

  useEffect(()=>{
    // Fetch challenges from API (AI-tagged server-side)
    fetch('/api/challenges').then(r=>r.json()).then(setChallenges).catch(()=>setChallenges([]))
  },[])

  async function findMatch(skills=[]){
    try{
      const res = await fetch('/api/match', {method:'POST',headers:{'content-type':'application/json'}, body: JSON.stringify({skills})})
      const j = await res.json()
      if(j.roomId) window.location.href = `/room/${j.roomId}`
    }catch(e){console.error(e)}
  }

  return (
    <div className="app">
      <header className="header">
        <div>
          <h1>LiveSkill Arena</h1>
          <div className="small">Personalized feed • GenUI previews • Dark mode adapts to ambient lighting</div>
        </div>
        <div style={{display:'flex',gap:8}}>
          <button className="button" onClick={()=>findMatch()}>Find Match</button>
          <Link href="/create"><button className="button">Create Challenge</button></Link>
          <Link href="/profile"><button className="card">Profile</button></Link>
          <button className="card" onClick={()=>setDark(!dark)}>{dark? 'Dark' : 'Light'} Mode</button>
        </div>
      </header>

      <section style={{display:'grid',gridTemplateColumns:'1fr 320px',gap:16,alignItems:'start'}}>
        <div>
          <h2 style={{marginTop:0}}>For you</h2>
          <div className="grid">
            {challenges.map(ch => (
              <div className="card" key={ch.id}>
                <div style={{display:'flex',justifyContent:'space-between'}}>
                  <div>
                    <strong>{ch.title}</strong>
                    <div className="small">Skills: {ch.skills.join(', ')}</div>
                  </div>
                  <div style={{textAlign:'right'}}>
                    <div style={{fontWeight:700}}>${ch.bounty}</div>
                    <Link href={`/room/${ch.id}`}><button className="button" style={{marginTop:8}}>Join Room</button></Link>
                  </div>
                </div>
                <div style={{marginTop:12}} className="small">Glassmorphic card updates in realtime as bids arrive. 3D preview available on hover.</div>
              </div>
            ))}
          </div>
        </div>

        <aside>
          <div className="card">
            <h3 style={{marginTop:0}}>Live 3D Preview</h3>
            <div className="preview">
              <ThreePreview />
            </div>
            <div className="small" style={{marginTop:8}}>Rotate the preview to inspect challenge artifacts (e.g., rotatable code snippet sneak-peak).</div>
          </div>

          <div className="card" style={{marginTop:12}}>
            <h4>Accessibility</h4>
            <div className="small">Haptic & high-contrast modes are simulated here. Use real device sensors in production.</div>
          </div>
        </aside>
      </section>

      <hr style={{borderColor:'rgba(255,255,255,0.03)',margin:'24px 0'}} />

      <footer className="small">LiveSkill Arena prototype — real-time demo with WebRTC + Socket.IO • Built for local testing</footer>
    </div>
  )
}
