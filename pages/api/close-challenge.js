const store = require('../../lib/store')
const { requireDevToken } = require('../../lib/devAuth')

export default function handler(req,res){
  if(req.method !== 'POST') return res.status(405).end()
  if(!requireDevToken(req,res)) return
  const { challengeId } = req.body || {}
  const ch = store.getChallenge(challengeId)
  if(!ch) return res.status(404).json({error:'challenge not found'})
  const votes = ch.votes || {}
  let winner = null
  let max = -1
  Object.keys(votes).forEach(tid => { if(votes[tid] > max){ max = votes[tid]; winner = tid } })
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
  res.status(200).json({ payout })
}
