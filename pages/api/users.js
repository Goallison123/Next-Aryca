const store = require('../../lib/store')
const { requireDevToken } = require('../../lib/devAuth')

export default function handler(req,res){
  if(req.method !== 'POST') return res.status(405).end()
  if(!requireDevToken(req,res)) return
  const {id,name} = req.body || {}
  if(!id || !name) return res.status(400).json({error:'id and name required'})
  const u = store.createUser(id,name)
  res.status(200).json(u)
}
