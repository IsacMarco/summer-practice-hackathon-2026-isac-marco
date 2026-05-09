import express from 'express'

import { requireAuth } from '../middleware/auth.js'
import Chat from '../models/Chat.js'
import Session from '../models/Session.js'
import Sport from '../models/Sport.js'
import User from '../models/User.js'
import { getDefaultSessionTime, getTodayKey } from '../utils/date.js'

const router = express.Router()

const shuffle = (items) => {
  const list = [...items]
  for (let i = list.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[list[i], list[j]] = [list[j], list[i]]
  }
  return list
}

const normalizeSkillLevel = (level = '') => {
  const value = String(level).trim().toLowerCase()
  if (value.startsWith('begin')) return 'beginner'
  if (value.startsWith('inter')) return 'intermediate'
  if (value.startsWith('adv')) return 'advanced'
  return ''
}

router.post('/', requireAuth, async (req, res) => {
  const currentUser = await User.findOne({ firebaseUid: req.user.uid })
  if (!currentUser) {
    return res.status(404).json({ error: 'User not found' })
  }

  const todayKey = getTodayKey()
  const availableUsers = await User.find({
    'availability.status': 'yes',
    'availability.date': todayKey,
  })

  const sports = await Sport.find()

  const assigned = new Set()
  const createdSessionIds = []

  for (const sport of sports) {
    const candidates = shuffle(
      availableUsers.filter((user) => {
        const playsSport = (user.sports || []).some(
          (sportId) => sportId.toString() === sport._id.toString(),
        )
        return playsSport && !assigned.has(user._id.toString())
      }),
    )

    while (candidates.length >= sport.minPlayers) {
      const seedLevel = normalizeSkillLevel(candidates[0]?.skillLevel)
      const compatible = candidates.filter((u) => {
        const level = normalizeSkillLevel(u.skillLevel)
        return !seedLevel || !level || level === seedLevel
      })
      const group = compatible.slice(0, sport.maxPlayers)
      group.forEach((member) => {
        const idx = candidates.findIndex((c) => c._id.toString() === member._id.toString())
        if (idx >= 0) candidates.splice(idx, 1)
      })
      if (group.length < sport.minPlayers) {
        break
      }

      group.forEach((member) => assigned.add(member._id.toString()))
      const captain = group[Math.floor(Math.random() * group.length)]

      const session = await Session.create({
        sport: sport._id,
        desiredPlayerLevels: seedLevel ? [seedLevel] : [],
        participants: group.map((member) => member._id),
        captain: captain._id,
        scheduledAt: getDefaultSessionTime(),
        status: 'pending',
      })

      const chat = await Chat.create({ session: session._id, messages: [] })
      session.chat = chat._id
      await session.save()

      createdSessionIds.push(session._id)
    }
  }

  const sessions = await Session.find({ participants: currentUser._id })
    .populate('sport participants captain location chat')
    .sort({ scheduledAt: 1 })

  return res.json({ createdSessionIds, sessions })
})

router.get('/suggest', requireAuth, async (req, res) => {
  const currentUser = await User.findOne({ firebaseUid: req.user.uid })
  if (!currentUser) {
    return res.status(404).json({ error: 'User not found' })
  }

  const userLevel = normalizeSkillLevel(currentUser.skillLevel)

  const sessions = await Session.find({
    scheduledAt: { $gte: new Date() },
    participants: { $ne: currentUser._id },
  }).populate('sport participants captain location chat createdBy')

  const available = sessions.filter(
    (session) =>
      (session.participants?.length || 0) < (session.sport?.maxPlayers || 0) &&
      (!userLevel ||
        !Array.isArray(session.desiredPlayerLevels) ||
        session.desiredPlayerLevels.length === 0 ||
        session.desiredPlayerLevels.includes(userLevel)),
  )

  if (available.length === 0) {
    return res.json({ session: null })
  }

  const picked = available[Math.floor(Math.random() * available.length)]
  return res.json({ session: picked })
})

export default router
