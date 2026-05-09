import express from 'express'

import { requireAdmin, requireAuth } from '../middleware/auth.js'
import User from '../models/User.js'

const router = express.Router()

router.get('/users', requireAuth, requireAdmin, async (req, res) => {
  const users = await User.find()
    .select('email displayName role createdAt')
    .sort({ createdAt: -1 })

  return res.json(users)
})

export default router
