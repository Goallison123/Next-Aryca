module.exports = {
  requireDevToken(req, res) {
    // Allow access automatically when not in production (local dev)
    if (process.env.NODE_ENV !== 'production') return true

    const auth = (req.headers && req.headers.authorization) || ''
    if (auth === 'Bearer dev-token') return true
    res.status(401).json({ error: 'Invalid or missing dev token' })
    return false
  }
}
