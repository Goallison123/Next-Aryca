const express = require('express')
const http = require('http')
const next = require('next')
const { Server } = require('socket.io')
const store = require('./lib/store')

// Naive AI-like auto-tagging helper (placeholder)
function autoTag({title, description, skills}){
  const base = (skills || []).slice(0,5)
  const text = (title + ' ' + (description||'')).toLowerCase()
  const tokens = text.match(/[a-z0-9]+/g) || []
  const freq = {}
  tokens.forEach(t => { if(t.length>3) freq[t] = (freq[t]||0)+1 })
  const top = Object.keys(freq).sort((a,b)=>freq[b]-freq[a]).slice(0,3)
  return Array.from(new Set([...base, ...top]))
}

const dev = process.env.NODE_ENV !== 'production'
const app = next({ dev })
const handle = app.getRequestHandler()

const PORT = process.env.PORT || 3000

app.prepare().then(() => {
  const server = express()
  server.use(express.json())
  const httpServer = http.createServer(server)
  const io = new Server(httpServer, {
    cors: { origin: '*' }
  })

  // Simple room management
  // socket joins a roomId and we broadcast peer updates
  io.on('connection', (socket) => {
    console.log('socket connected', socket.id)

    socket.on('join-room', ({ roomId, user }) => {
      socket.join(roomId)
      socket.to(roomId).emit('peer-joined', { peerId: socket.id, user })
      // tell the joining client about existing peers
      const clients = Array.from(io.sockets.adapter.rooms.get(roomId) || [])
      const otherPeers = clients.filter((id) => id !== socket.id)
      socket.emit('peers', otherPeers)
    })

    socket.on('signal', ({ to, from, data }) => {
      io.to(to).emit('signal', { from, data })
    })

    socket.on('leave-room', ({ roomId }) => {
      socket.leave(roomId)
      socket.to(roomId).emit('peer-left', { peerId: socket.id })
    })

    socket.on('disconnecting', () => {
      const rooms = Array.from(socket.rooms).filter((r) => r !== socket.id)
      rooms.forEach((roomId) => {
        socket.to(roomId).emit('peer-left', { peerId: socket.id })
      })
    })
  })

  // Challenge endpoints (prototype, in-memory store)
  server.post('/api/challenges', (req, res) => {
    const { title, description, bounty, duration, skills, poster } = req.body
    if(!title || !bounty) return res.status(400).json({error:'title and bounty required'})
    const id = `c-${Math.random().toString(36).slice(2,9)}`
    const tags = autoTag({title, description, skills})
    const ch = store.createChallenge({ id, title, description, bounty, duration, skills: tags, poster })
    res.json(ch)
  })

  server.get('/api/challenges', (req, res) => {
    res.json(store.listChallenges())
  })

  // Simple matchmaking: accept skills & optionally challengeId, return room and matched solvers
  server.post('/api/match', (req, res) => {
    const { skills = [], location, challengeId } = req.body
    // In production, call AI matcher - for demo we simulate matching by returning mock solver ids based on skills
    const matched = []
    for(let i=0;i<3;i++) matched.push({id: `solver-${Math.random().toString(36).slice(2,6)}`, skills: skills.slice(0,2), rating: (3+i)})
    const roomId = challengeId ? `room-${challengeId}` : `room-${Math.random().toString(36).slice(2,9)}`
    if(challengeId) store.openRoomForChallenge(challengeId, roomId)
    res.json({ roomId, matched })
  })

  // Voting endpoint
  server.post('/api/vote', (req, res) => {
    const { challengeId, teamId, voterId } = req.body
    if(!challengeId || !teamId) return res.status(400).json({error:'challengeId and teamId required'})
    const votes = store.recordVote(challengeId, teamId, voterId)
    res.json({ votes })
  })

  // Close a challenge and calculate payouts (simulated rules)
  server.post('/api/close-challenge', (req, res) => {
    const { challengeId } = req.body
    const ch = store.getChallenge(challengeId)
    if(!ch) return res.status(404).json({error:'challenge not found'})
    // determine winning team by votes
    const votes = ch.votes || {}
    let winner = null
    let max = -1
    Object.keys(votes).forEach(tid => { if(votes[tid] > max){ max = votes[tid]; winner = tid } })

    // simulate payouts: 70% of bounty to winning team split equally; platform fee 20%
    const bounty = ch.bounty || 0
    const platformCut = +(bounty * 0.2).toFixed(2)
    const pool = +(bounty * 0.7).toFixed(2)
    const teamSize = winner ? parseInt(winner.split('-')[1] || '1') : 1
    const perMember = +(pool / Math.max(1, teamSize)).toFixed(2)

    const payout = {
      challengeId,
      winner,
      pool,
      platformCut,
      perMember,
      distributedAt: Date.now()
    }
    store.recordPayout(challengeId, payout)
    store.closeChallenge(challengeId)
    res.json({ payout })
  })

  server.get('/api/payout/:id', (req, res) => {
    const p = store.getPayout(req.params.id)
    if(!p) return res.status(404).json({error:'payout not found'})
    res.json(p)
  })

  server.post('/api/users', (req,res)=>{
    const {id,name} = req.body
    if(!id || !name) return res.status(400).json({error:'id and name required'})
    const u = store.createUser(id,name)
    res.json(u)
  })

  server.all('*', (req, res) => {
    return handle(req, res)
  })

  httpServer.listen(PORT, (err) => {
    if (err) throw err
    console.log(`> Ready on http://localhost:${PORT}`)
  })
}).catch((err) => {
  console.error(err)
  process.exit(1)
})
