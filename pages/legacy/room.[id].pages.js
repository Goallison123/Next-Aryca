import { useEffect, useRef, useState } from 'react'
import io from 'socket.io-client'
import SimplePeer from 'simple-peer'
import VideoGrid from '../../components/VideoGrid'
import Link from 'next/link'

let socket

export default function Room({query}){
  const [localStream, setLocalStream] = useState(null)
  const [peers, setPeers] = useState({}) // id -> {peer, stream, name}
  const [joined, setJoined] = useState(false)
  const [challenge, setChallenge] = useState(null)
  const [payout, setPayout] = useState(null)
  const localRef = useRef()
  const roomId = typeof window !== 'undefined' ? window.location.pathname.split('/').pop() : query.id

  useEffect(()=>{
    // try to resolve challenge from roomId pattern 'room-c-xxxxx'
    async function load(){
      if(!roomId) return
      // fetch all challenges and find the one matching the id when roomId is 'room-<challengeId>'
      const parts = roomId.split('-')
      const maybe = parts[1] && parts[1].startsWith('c') ? roomId.replace('room-','') : null
      const res = await fetch('/api/challenges')
      const list = await res.json()
      const ch = list.find(ch => ch.id === maybe)
      if(ch) setChallenge(ch)
    }
    load()
  },[roomId])

  useEffect(()=>{
    if(!process.browser) return
    socket = io()
    return ()=>{ if(socket) socket.disconnect() }
  },[])

  async function startLocal(){
    const s = await navigator.mediaDevices.getUserMedia({video:true,audio:true})
    setLocalStream(s)
    if(localRef.current) localRef.current.srcObject = s
  }

  useEffect(()=>{
    if(!socket) return

    socket.on('connect', () => console.log('socket connected', socket.id))

    socket.on('peers', async (others) => {
      // initiate connections to others
      for(const id of others){
        createPeer(id, true)
      }
    })

    socket.on('peer-joined', ({ peerId, user }) => {
      // A peer joined after us
      createPeer(peerId, false)
    })

    socket.on('signal', async ({ from, data }) => {
      // route to the correct peer instance
      const entry = peers[from]
      if(entry && entry.peer){
        entry.peer.signal(data)
      }
    })

    socket.on('peer-left', ({ peerId }) => {
      setPeers(prev => { const n = {...prev}; delete n[peerId]; return n })
    })

    return ()=>{
      socket.off('connect')
      socket.off('peers')
      socket.off('peer-joined')
      socket.off('signal')
      socket.off('peer-left')
    }
  },[socket, peers])

  function createPeer(peerId, initiator){
    if(!localStream) {
      console.warn('no local stream yet')
      return
    }
    const p = new SimplePeer({initiator, trickle:true, stream: localStream})
    p.on('signal', data => {
      socket.emit('signal', { to: peerId, from: socket.id, data })
    })
    p.on('stream', stream => {
      setPeers(prev => ({...prev, [peerId]: {peer:p, stream, name:'Peer'}}))
    })
    p.on('error', (e)=> console.error('peer error', e))
    p.on('close', ()=> {
      setPeers(prev => { const n = {...prev}; delete n[peerId]; return n })
    })
    setPeers(prev => ({...prev, [peerId]: {peer:p, stream: null, name:'Peer'}}))
  }

  async function join(){
    if(!localStream) await startLocal()
    socket.emit('join-room', { roomId, user: {name:'You'} })
    setJoined(true)
  }

  function leave(){
    socket.emit('leave-room', { roomId })
    Object.values(peers).forEach(entry => { if(entry.peer) entry.peer.destroy() })
    setPeers({})
    setJoined(false)
    if(localStream){ localStream.getTracks().forEach(t => t.stop()); setLocalStream(null) }
  }

  return (
    <div className="app">
      <div className="header">
        <div>
          <h2>Challenge Room: <span className="small">{roomId}</span></h2>
          <div className="small">Real-time collaboration demo. Viewer interactions & tipping are placeholders.</div>
        </div>
        <div style={{display:'flex',gap:8}}>
          {!joined ? <button className="button" onClick={join}>Join Room</button> : <button className="button" onClick={leave}>Leave</button>}
          {challenge && <button className="button" onClick={async()=>{
            // End session & compute payouts
            if(!confirm('End session and compute payouts?')) return
            const res = await fetch('/api/close-challenge',{method:'POST',headers:{'content-type':'application/json'}, body: JSON.stringify({challengeId: challenge.id})})
            const j = await res.json()
            if(j.payout){
              alert('Payout computed. Check the session sidebar for details.')
              setPayout(j.payout)
            }
          }}>End Session</button>}
          <Link href="/"><button className="card">Back</button></Link>
        </div>
      </div>

      <div className="card" style={{display:'grid',gridTemplateColumns:'1fr 320px',gap:12}}>
        <div>
          <div style={{marginBottom:12}}>
            <strong>Stage</strong>
            <div className="small">Team members and shared screens appear here. Move fast — bounties tick down.</div>
          </div>

          <div style={{display:'flex',gap:12}}>
            <div style={{flex:1}}>
              <div className="videoBox card">
                <div style={{padding:8,display:'flex',justifyContent:'space-between'}}>
                  <div className="small">You</div>
                </div>
                <video className="video" autoPlay muted playsInline ref={localRef}></video>
              </div>

              <div style={{marginTop:12}}>
                <VideoGrid streams={Object.keys(peers).map(id => ({id, stream: peers[id].stream, name: peers[id].name}))} />
              </div>
            </div>

            <aside style={{width:280}}>
              <div className="card">
                <h4 style={{marginTop:0}}>Viewer Panel</h4>
                <div className="small">Live votes and tips will appear here. This demo shows the structure.</div>
                <div style={{marginTop:8}}>
                  <div style={{display:'flex',gap:8}}>
                    <button className="button" onClick={async()=>{
                      if(!challenge){ alert('No challenge linked to this room'); return }
                      await fetch('/api/vote',{method:'POST',headers:{'content-type':'application/json'}, body: JSON.stringify({challengeId: challenge.id, teamId:'team-1', voterId:'viewer-1'})})
                      alert('Voted for Team 1')
                    }}>Vote Team 1</button>

                    <button className="button" onClick={async()=>{
                      if(!challenge){ alert('No challenge linked to this room'); return }
                      await fetch('/api/vote',{method:'POST',headers:{'content-type':'application/json'}, body: JSON.stringify({challengeId: challenge.id, teamId:'team-2', voterId:'viewer-1'})})
                      alert('Voted for Team 2')
                    }}>Vote Team 2</button>
                  </div>

                  {payout && <div style={{marginTop:8}} className="small">Payout: {JSON.stringify(payout)}</div>}
                </div>
              </div>

              <div className="card" style={{marginTop:12}}>
                <h4 style={{marginTop:0}}>AI Agent</h4>
                <div className="small">Suggested fixes appear with explainable popups. (Placeholder)</div>
              </div>
            </aside>
          </div>
        </div>

        <aside>
          <div className="card">
            <h4 style={{marginTop:0}}>3D Interaction Canvas</h4>
            <div style={{height:240}}>
              <div style={{width:'100%',height:'100%',display:'flex',alignItems:'center',justifyContent:'center',color:'var(--muted)'}}>WebGL canvas & floating editors (placeholder)</div>
            </div>
          </div>

          <div className="card" style={{marginTop:12}}>
            <h4 style={{marginTop:0}}>Session Info</h4>
            <div className="small">Team size: {Object.keys(peers).length + (joined? 1 : 0)}</div>
            <div className="small">Bounty: $120 • Time left: 29:45</div>
          </div>
        </aside>
      </div>
    </div>
  )
}

export async function getServerSideProps({params}){
  return { props: { query: params } }
}
