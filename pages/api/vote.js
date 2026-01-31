const store = require('../../lib/store')
const { requireDevToken } = require('../../lib/devAuth')

export default function handler(req,res){
  if(req.method !== 'POST') return res.status(405).end()
  if(!requireDevToken(req,res)) return
  const { challengeId, teamId, voterId } = req.body || {}
  if(!challengeId || !teamId) return res.status(400).json({error:'challengeId and teamId required'})
  const votes = store.recordVote(challengeId, teamId, voterId)
  res.status(200).json({ votes })
}
