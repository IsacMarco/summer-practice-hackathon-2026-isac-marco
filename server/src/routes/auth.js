import express from 'express'

import { requireAuth } from '../middleware/auth.js'
import User from '../models/User.js'

const router = express.Router()

router.post('/sync', requireAuth, async (req, res) => {
  const { email, displayName } = req.body

  if (!email) {
    return res.status(400).json({ error: 'Email is required' })
  }

  const adminEmails = (process.env.ADMIN_EMAILS || '')
    .split(',')
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean)

  const isAdmin = adminEmails.includes(email.toLowerCase())

  let user = await User.findOne({ firebaseUid: req.user.uid })

  if (!user) {
    user = await User.create({
      firebaseUid: req.user.uid,
      email,
      displayName: displayName || '',
      role: isAdmin ? 'admin' : 'user',
    })
  } else {
    user.email = email
    if (displayName !== undefined) {
      user.displayName = displayName
    }
    user.role = isAdmin ? 'admin' : 'user'
    await user.save()
  }

  return res.json(user)
})

export default router
