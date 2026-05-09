import express from 'express'

import { requireAuth } from '../middleware/auth.js'
import User from '../models/User.js'

const router = express.Router()

router.get('/me', requireAuth, async (req, res) => {
  const user = await User.findOne({ firebaseUid: req.user.uid }).populate('sports')

  if (!user) {
    return res.status(404).json({ error: 'User not found' })
  }

  return res.json(user)
})

router.put('/me', requireAuth, async (req, res) => {
  const user = await User.findOne({ firebaseUid: req.user.uid })
  if (!user) {
    return res.status(404).json({ error: 'User not found' })
  }

  const { displayName, bio, skillLevel, sports, photoBase64 } = req.body

  if (displayName !== undefined) {
    user.displayName = displayName
  }
  if (bio !== undefined) {
    user.bio = bio
  }
  if (skillLevel !== undefined) {
    user.skillLevel = skillLevel
  }
  if (photoBase64 !== undefined) {
    user.photoBase64 = photoBase64
  }
  if (Array.isArray(sports)) {
    user.sports = sports
  }

  await user.save()

  const hydrated = await User.findById(user._id).populate('sports')
  return res.json(hydrated)
})

export default router
