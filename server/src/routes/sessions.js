import express from 'express'

import { requireAuth } from '../middleware/auth.js'
import Chat from '../models/Chat.js'
import Location from '../models/Location.js'
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
  if (req.query.upcoming === '1') {
    query.scheduledAt = { $gte: new Date() }
  }

  const sessions = await Session.find(query)
    .populate('sport participants captain location chat createdBy')
    .sort({ scheduledAt: 1 })

  return res.json(sessions)
})

router.get('/:id', requireAuth, async (req, res) => {
  const session = await Session.findById(req.params.id).populate(
    'sport participants captain location chat createdBy',
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

  const {
    name,
    sportId,
    scheduledAt,
    locationId,
    participantIds,
    desiredPlayerLevels,
  } = req.body
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

  const parsedSchedule = scheduledAt ? new Date(scheduledAt) : getDefaultSessionTime()
  if (Number.isNaN(parsedSchedule.getTime())) {
    return res.status(400).json({ error: 'Invalid session date' })
  }
  if (parsedSchedule < new Date()) {
    return res.status(400).json({ error: 'Session date cannot be in the past' })
  }

  if (locationId) {
    const location = await Location.findById(locationId).select('sports')
    if (!location) {
      return res.status(404).json({ error: 'Location not found' })
    }
    if (
      Array.isArray(location.sports) &&
      location.sports.length > 0 &&
      !location.sports.some((id) => id.toString() === sport._id.toString())
    ) {
      return res
        .status(400)
        .json({ error: 'Selected location does not support this sport' })
    }
  }

  const participants = new Set(
    Array.isArray(participantIds) ? participantIds.map((id) => id.toString()) : [],
  )
  participants.add(user._id.toString())

  if (participants.size > sport.maxPlayers) {
    return res.status(400).json({ error: 'Too many participants for this sport' })
  }

  const session = await Session.create({
    name: name || '',
    sport: sport._id,
    desiredPlayerLevels:
      normalizedLevels,
    participants: [...participants],
    captain: user._id,
    scheduledAt: parsedSchedule,
    location: locationId || undefined,
    createdBy: user._id,
  })

  const chat = await Chat.create({ session: session._id, messages: [] })
  session.chat = chat._id
  await session.save()

  const hydrated = await Session.findById(session._id).populate(
    'sport participants captain location chat createdBy',
  )

  return res.status(201).json(hydrated)
})

router.delete('/:id', requireAuth, async (req, res) => {
  const user = await User.findOne({ firebaseUid: req.user.uid })
  if (!user) {
    return res.status(404).json({ error: 'User not found' })
  }

  const session = await Session.findById(req.params.id)
  if (!session) {
    return res.status(404).json({ error: 'Session not found' })
  }

  const isCreator = session.createdBy?.toString() === user._id.toString()
  const isAdmin = user.role === 'admin'
  if (!isCreator && !isAdmin) {
    return res.status(403).json({ error: 'Not allowed to delete this session' })
  }

  await Chat.deleteOne({ session: session._id })
  await Session.deleteOne({ _id: session._id })

  return res.json({ ok: true })
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
    'sport participants captain location chat createdBy',
  )

  return res.json(hydrated)
})

router.post('/:id/leave', requireAuth, async (req, res) => {
  const user = await User.findOne({ firebaseUid: req.user.uid })
  if (!user) {
    return res.status(404).json({ error: 'User not found' })
  }

  const session = await Session.findById(req.params.id).populate('sport')
  if (!session) {
    return res.status(404).json({ error: 'Session not found' })
  }

  session.participants = session.participants.filter(
    (participantId) => participantId.toString() !== user._id.toString(),
  )

  if (session.captain?.toString() === user._id.toString()) {
    session.captain = session.participants[0] || undefined
  }

  if (session.participants.length === 0) {
    await Chat.deleteOne({ session: session._id })
    await Session.deleteOne({ _id: session._id })
    return res.json({ ok: true, removed: true })
  }

  await session.save()

  const hydrated = await Session.findById(session._id).populate(
    'sport participants captain location chat createdBy',
  )

  return res.json({ ok: true, removed: false, session: hydrated })
})

router.post('/:id/broadcast-invite', requireAuth, async (req, res) => {
  const user = await User.findOne({ firebaseUid: req.user.uid })
  if (!user) {
    return res.status(404).json({ error: 'User not found' })
  }

  const session = await Session.findById(req.params.id).populate(
    'sport participants captain location',
  )
  if (!session) {
    return res.status(404).json({ error: 'Session not found' })
  }
  if (session.createdBy?.toString() !== user._id.toString()) {
    return res.status(403).json({ error: 'Only session creator can broadcast invites' })
  }

  const targetLevels = Array.isArray(session.desiredPlayerLevels)
    ? session.desiredPlayerLevels
    : []
  const currentParticipants = session.participants.map((id) => id.toString())
  const invitedUsers = await User.find({
    _id: { $nin: currentParticipants },
    sports: session.sport._id,
  }).select('_id skillLevel')

  const normalizeSkillLevel = (level = '') => {
    const value = String(level).toLowerCase()
    if (value.startsWith('begin')) return 'beginner'
    if (value.startsWith('inter')) return 'intermediate'
    if (value.startsWith('adv')) return 'advanced'
    return ''
  }

  const filteredTargets = invitedUsers.filter((targetUser) => {
    if (!targetLevels.length) return true
    const level = normalizeSkillLevel(targetUser.skillLevel)
    return level && targetLevels.includes(level)
  })

  const playersText = session.participants
    .map((p) => p.displayName || p.email || 'Player')
    .join(', ')
  const message = `You were invited by ${
    user.displayName || user.email
  } to session "${session.name || session.sport?.name}" with players ${playersText} at ${
    session.location?.name || 'Location TBD'
  }, cost ${session.location?.priceEstimate || 'N/A'}.`

  await User.updateMany(
    { _id: { $in: filteredTargets.map((u) => u._id) } },
    {
      $push: {
        invites: {
          session: session._id,
          fromUser: user._id,
          message,
          status: 'pending',
          createdAt: new Date(),
        },
      },
    },
  )

  return res.json({ ok: true, invitedCount: filteredTargets.length })
})

export default router
