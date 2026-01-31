const store = require('../../lib/store')
const { requireDevToken } = require('../../lib/devAuth')

export default function handler(req, res){
  const { method } = req
  if(method === 'POST'){
    if(!requireDevToken(req, res)) return
    const { title, description, bounty, duration, skills, poster } = req.body
    if(!title || !bounty) return res.status(400).json({error:'title and bounty required'})
    const id = `c-${Math.random().toString(36).slice(2,9)}`
    // lightweight auto-tagging kept in server-side helper
    const autoTag = ({title, description, skills})=>{
      const base = (skills || []).slice(0,5)
      const text = (title + ' ' + (description||'')).toLowerCase()
      const tokens = text.match(/[a-z0-9]+/g) || []
      const freq = {}
      tokens.forEach(t => { if(t.length>3) freq[t] = (freq[t]||0)+1 })
      const top = Object.keys(freq).sort((a,b)=>freq[b]-freq[a]).slice(0,3)
      return Array.from(new Set([...base, ...top]))
    }
    const tags = autoTag({title, description, skills})
    const ch = store.createChallenge({ id, title, description, bounty, duration, skills: tags, poster })
    return res.status(200).json(ch)
  }

  if(method === 'GET'){
    return res.status(200).json(store.listChallenges())
  }

  res.setHeader('Allow', ['GET','POST'])
  res.status(405).end(`Method ${method} Not Allowed`)
}
