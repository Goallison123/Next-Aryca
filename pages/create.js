import { useState } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'

export default function Create(){
  const [title,setTitle] = useState('')
  const [description,setDescription] = useState('')
  const [bounty,setBounty] = useState(50)
  const [duration,setDuration] = useState(30)
  const [skills,setSkills] = useState('')
  const [loading,setLoading] = useState(false)
  const router = useRouter()

  async function submit(e){
    e.preventDefault()
    setLoading(true)
    const body = { title, description, bounty: Number(bounty), duration: Number(duration), skills: skills.split(',').map(s=>s.trim()).filter(Boolean), poster: {id:'poster-1', name:'Poster'} }
    const res = await fetch('/api/challenges',{method:'POST',headers:{'content-type':'application/json'}, body: JSON.stringify(body)})
    const ch = await res.json()
    // auto-open match/room for this challenge
    const r = await fetch('/api/match', {method:'POST', headers:{'content-type':'application/json'}, body: JSON.stringify({skills: ch.skills, challengeId: ch.id})})
    const j = await r.json()
    setLoading(false)
    if(j.roomId) router.push(`/room/${j.roomId}`)
  }

  return (
    <div className="app">
      <div className="header">
        <div>
          <h2>Create Challenge</h2>
          <div className="small">Create a live challenge and set a bounty to attract solvers.</div>
        </div>
        <div style={{display:'flex',gap:8}}>
          <Link href="/"><button className="card">Back</button></Link>
        </div>
      </div>

      <div className="card" style={{maxWidth:720}}>
        <form onSubmit={submit}>
          <div style={{marginBottom:12}}>
            <label className="small">Title</label>
            <div><input value={title} onChange={e=>setTitle(e.target.value)} style={{width:'100%',padding:8,borderRadius:6,border:'1px solid rgba(255,255,255,0.06)'}} required /></div>
          </div>

          <div style={{marginBottom:12}}>
            <label className="small">Description</label>
            <div><textarea value={description} onChange={e=>setDescription(e.target.value)} style={{width:'100%',padding:8,borderRadius:6}} rows={4} /></div>
          </div>

          <div style={{display:'flex',gap:12}}>
            <div>
              <label className="small">Bounty ($)</label>
              <div><input type="number" value={bounty} onChange={e=>setBounty(e.target.value)} style={{padding:8,borderRadius:6,width:140}} min={10} max={500} /></div>
            </div>

            <div>
              <label className="small">Duration (mins)</label>
              <div><input type="number" value={duration} onChange={e=>setDuration(e.target.value)} style={{padding:8,borderRadius:6,width:140}} min={10} max={60} /></div>
            </div>

            <div style={{flex:1}}>
              <label className="small">Skills (comma separated)</label>
              <div><input value={skills} onChange={e=>setSkills(e.target.value)} style={{width:'100%',padding:8,borderRadius:6}} placeholder="e.g. react, payments" /></div>
            </div>
          </div>

          <div style={{marginTop:12}}>
            <button className="button" disabled={loading}>{loading? 'Creating...' : 'Create & Start Match'}</button>
          </div>
        </form>
      </div>
    </div>
  )
}
