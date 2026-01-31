const store = require('../../../lib/store')

export default function handler(req,res){
  const { id } = req.query
  if(req.method !== 'GET') return res.status(405).end()
  const p = store.getPayout(id)
  if(!p) return res.status(404).json({error:'payout not found'})
  res.status(200).json(p)
}
