import express from 'express'

import { requireAuth } from '../middleware/auth.js'
import Chat from '../models/Chat.js'
import Session from '../models/Session.js'
import Sport from '../models/Sport.js'
import User from '../models/User.js'
import { getDefaultSessionTime } from '../utils/date.js'

const router = express.Router()
const ALLOWED_PLAYER_LEVELS = ['beginner', 'intermediate', 'advanced']

router.get('/', requireAuth, async (req, res) => {
  const user = await User.findOne({ firebaseUid: req.user.uid })
  if (!user) {
    return res.status(404).json({ error: 'User not found' })
  }

  const query = req.query.me === '1' ? { participants: user._id } : {}

  const sessions = await Session.find(query)
    .populate('sport participants captain location chat')
    .sort({ scheduledAt: 1 })

  return res.json(sessions)
})

router.get('/:id', requireAuth, async (req, res) => {
  const session = await Session.findById(req.params.id).populate(
    'sport participants captain location chat',
  )

  if (!session) {
    return res.status(404).json({ error: 'Session not found' })
  }

  return res.json(session)
})

router.post('/', requireAuth, async (req, res) => {
  const user = await User.findOne({ firebaseUid: req.user.uid })
  if (!user) {
    return res.status(404).json({ error: 'User not found' })
  }

  const { sportId, scheduledAt, locationId, participantIds, desiredPlayerLevels } =
    req.body
  if (!sportId) {
    return res.status(400).json({ error: 'Sport is required' })
  }

  const sport = await Sport.findById(sportId)
  if (!sport) {
    return res.status(404).json({ error: 'Sport not found' })
  }

  const normalizedLevels = Array.isArray(desiredPlayerLevels)
    ? [...new Set(desiredPlayerLevels.map((level) => String(level).toLowerCase()))]
    : []

  if (
    normalizedLevels.length > 0 &&
    normalizedLevels.some((level) => !ALLOWED_PLAYER_LEVELS.includes(level))
  ) {
    return res.status(400).json({ error: 'Invalid player level selection' })
  }

  const participants = new Set(
    Array.isArray(participantIds) ? participantIds.map((id) => id.toString()) : [],
  )
  participants.add(user._id.toString())

  if (participants.size > sport.maxPlayers) {
    return res.status(400).json({ error: 'Too many participants for this sport' })
  }

  const session = await Session.create({
    sport: sport._id,
    desiredPlayerLevels:
      normalizedLevels.length > 0 ? normalizedLevels : ALLOWED_PLAYER_LEVELS,
    participants: [...participants],
    captain: user._id,
    scheduledAt: scheduledAt ? new Date(scheduledAt) : getDefaultSessionTime(),
    location: locationId || undefined,
    createdBy: user._id,
  })

  const chat = await Chat.create({ session: session._id, messages: [] })
  session.chat = chat._id
  await session.save()

  const hydrated = await Session.findById(session._id).populate(
    'sport participants captain location chat',
  )

  return res.status(201).json(hydrated)
})

router.post('/:id/join', requireAuth, async (req, res) => {
  const user = await User.findOne({ firebaseUid: req.user.uid })
  if (!user) {
    return res.status(404).json({ error: 'User not found' })
  }

  const session = await Session.findById(req.params.id).populate('sport')
  if (!session) {
    return res.status(404).json({ error: 'Session not found' })
  }

  const participantIds = session.participants.map((id) => id.toString())
  if (!participantIds.includes(user._id.toString())) {
    if (participantIds.length >= session.sport.maxPlayers) {
      return res.status(400).json({ error: 'Session is full' })
    }

    session.participants.push(user._id)
    await session.save()
  }

  const hydrated = await Session.findById(session._id).populate(
    'sport participants captain location chat',
  )

  return res.json(hydrated)
})

export default router
