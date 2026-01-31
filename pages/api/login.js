export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { username, password } = req.body || {}

  // DEV-ONLY static credentials
  if (username === 'admin' && password === 'password') {
    return res.status(200).json({ token: 'dev-token', user: { username: 'admin' } })
  }

  return res.status(401).json({ error: 'Invalid credentials' })
}
