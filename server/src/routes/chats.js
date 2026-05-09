import express from 'express'

import { requireAuth } from '../middleware/auth.js'
import Chat from '../models/Chat.js'
import Session from '../models/Session.js'
import User from '../models/User.js'

const router = express.Router()

router.get('/:sessionId', requireAuth, async (req, res) => {
  const user = await User.findOne({ firebaseUid: req.user.uid })
  if (!user) {
    return res.status(404).json({ error: 'User not found' })
  }

  const session = await Session.findById(req.params.sessionId).select('participants')
  if (!session) {
    return res.status(404).json({ error: 'Session not found' })
  }

  const isParticipant = session.participants.some(
    (participantId) => participantId.toString() === user._id.toString(),
  )
  if (!isParticipant) {
    return res.status(403).json({ error: 'Join this session to access the chat' })
  }

  const chat = await Chat.findOne({ session: req.params.sessionId }).populate({
    path: 'messages.sender',
    select: 'displayName photoBase64',
  })

  if (!chat) {
    return res.json({ session: req.params.sessionId, messages: [] })
  }

  return res.json(chat)
})

router.post('/:sessionId', requireAuth, async (req, res) => {
  const { text } = req.body

  if (!text) {
    return res.status(400).json({ error: 'Message text is required' })
  }

  const user = await User.findOne({ firebaseUid: req.user.uid })
  if (!user) {
    return res.status(404).json({ error: 'User not found' })
  }

  const session = await Session.findById(req.params.sessionId).select('participants')
  if (!session) {
    return res.status(404).json({ error: 'Session not found' })
  }

  const isParticipant = session.participants.some(
    (participantId) => participantId.toString() === user._id.toString(),
  )
  if (!isParticipant) {
    return res.status(403).json({ error: 'Join this session to send messages' })
  }

  let chat = await Chat.findOne({ session: req.params.sessionId })
  if (!chat) {
    chat = await Chat.create({ session: req.params.sessionId, messages: [] })
  }

  chat.messages.push({
    sender: user._id,
    text,
    timestamp: new Date(),
  })

  await chat.save()

  const hydrated = await Chat.findById(chat._id).populate({
    path: 'messages.sender',
    select: 'displayName photoBase64',
  })

  return res.status(201).json(hydrated)
})

export default router
