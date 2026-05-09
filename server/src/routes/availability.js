import express from 'express'

import { requireAuth } from '../middleware/auth.js'
import User from '../models/User.js'
import { getTodayKey } from '../utils/date.js'

const router = express.Router()

router.post('/', requireAuth, async (req, res) => {
  const { available, date } = req.body

  if (typeof available !== 'boolean') {
    return res.status(400).json({ error: 'Available must be boolean' })
  }

  const user = await User.findOne({ firebaseUid: req.user.uid })
  if (!user) {
    return res.status(404).json({ error: 'User not found' })
  }

  const availabilityDate = date || getTodayKey()

  user.availability = {
    status: available ? 'yes' : 'no',
    date: availabilityDate,
  }

  await user.save()

  return res.json(user.availability)
})

export default router
