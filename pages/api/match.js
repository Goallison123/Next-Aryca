const store = require('../../lib/store')

export default function handler(req, res){
  if(req.method !== 'POST') return res.status(405).end()
  const { skills = [], location, challengeId } = req.body || {}
  const matched = []
  for(let i=0;i<3;i++) matched.push({id: `solver-${Math.random().toString(36).slice(2,6)}`, skills: skills.slice(0,2), rating: (3+i)})
  const roomId = challengeId ? `room-${challengeId}` : `room-${Math.random().toString(36).slice(2,9)}`
  if(challengeId) store.openRoomForChallenge(challengeId, roomId)
  res.status(200).json({ roomId, matched })
}
