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

router.post('/', requireAuth, async (req, res) => {
  const currentUser = await User.findOne({ firebaseUid: req.user.uid })
  if (!currentUser) {
    return res.status(404).json({ error: 'User not found' })
  }

  const todayKey = getTodayKey()
  const availableUsers = await User.find({
    'availability.status': 'yes',
    'availability.date': todayKey,
  }).populate('sports')

  const sports = await Sport.find()

  const assigned = new Set()
  const createdSessionIds = []

  for (const sport of sports) {
    const candidates = shuffle(
      availableUsers.filter(
        (user) =>
          user.sports.some((userSport) => userSport._id.equals(sport._id)) &&
          !assigned.has(user._id.toString()),
      ),
    )

    while (candidates.length >= sport.minPlayers) {
      const group = candidates.splice(0, sport.maxPlayers)
      if (group.length < sport.minPlayers) {
        break
      }

      group.forEach((member) => assigned.add(member._id.toString()))
      const captain = group[Math.floor(Math.random() * group.length)]

      const session = await Session.create({
        sport: sport._id,
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

export default router
