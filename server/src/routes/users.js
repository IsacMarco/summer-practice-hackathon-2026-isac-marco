import express from 'express'

import { requireAuth } from '../middleware/auth.js'
import Session from '../models/Session.js'
import Sport from '../models/Sport.js'
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

router.post('/me/ai-suggestions', requireAuth, async (req, res) => {
  const user = await User.findOne({ firebaseUid: req.user.uid })
  if (!user) {
    return res.status(404).json({ error: 'User not found' })
  }

  const bio = String(req.body?.bio || '').trim()
  if (!bio) {
    return res.status(400).json({ error: 'Bio is required' })
  }

  const geminiApiKey = process.env.GEMINI_API_KEY || process.env.Gemini_API_KEY
  if (!geminiApiKey) {
    return res.status(400).json({ error: 'Missing GEMINI_API_KEY on server' })
  }

  const sports = await Sport.find().select('name')
  const sportNames = sports.map((sport) => sport.name)
  const prompt = `
You are a strict JSON API.
Analyze this user bio and infer likely player skill level and favorite sports.
Allowed levels: Beginner, Intermediate, Advanced.
Allowed sports: ${sportNames.join(', ')}.
Return only valid minified JSON:
{"skillLevel":"<one-level>","sports":["<sport-name>"]}
Bio: ${bio}
`

  const callGemini = async (model) =>
    fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${geminiApiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.2,
            responseMimeType: 'application/json',
          },
        }),
      },
    )

  let response = await callGemini('gemini-1.5-flash')
  if (!response.ok) {
    response = await callGemini('gemini-1.5-flash-8b')
  }

  if (!response.ok) {
    return res.status(502).json({ error: 'AI suggestion failed' })
  }

  const payload = await response.json()
  const raw = payload?.candidates?.[0]?.content?.parts?.[0]?.text || '{}'

  let parsed = {}
  try {
    const normalized = raw.replace(/```json|```/g, '').trim()
    parsed = JSON.parse(normalized)
  } catch {
    return res.status(502).json({ error: 'AI returned invalid JSON' })
  }

  const allowedLevels = ['Beginner', 'Intermediate', 'Advanced']
  const pickedLevel = allowedLevels.includes(parsed.skillLevel)
    ? parsed.skillLevel
    : ''

  const selectedSports = Array.isArray(parsed.sports)
    ? parsed.sports
        .map((name) => sports.find((sport) => sport.name === name))
        .filter(Boolean)
    : []

  return res.json({
    skillLevel: pickedLevel,
    sports: selectedSports.map((sport) => sport._id.toString()),
    sportsLabels: selectedSports.map((sport) => sport.name),
  })
})

router.get('/me/invites', requireAuth, async (req, res) => {
  const user = await User.findOne({ firebaseUid: req.user.uid })
    .populate('invites.session')
    .populate('invites.fromUser', 'displayName email')
  if (!user) {
    return res.status(404).json({ error: 'User not found' })
  }

  const invites = (user.invites || []).filter((invite) => invite.status === 'pending')
  return res.json(invites)
})

router.post('/me/invites/:inviteId/respond', requireAuth, async (req, res) => {
  const user = await User.findOne({ firebaseUid: req.user.uid })
  if (!user) {
    return res.status(404).json({ error: 'User not found' })
  }
  const { action } = req.body
  if (!['accept', 'refuse'].includes(action)) {
    return res.status(400).json({ error: 'Invalid invite action' })
  }

  const invite = (user.invites || []).find((item) => item._id.toString() === req.params.inviteId)
  if (!invite) {
    return res.status(404).json({ error: 'Invite not found' })
  }
  if (invite.status !== 'pending') {
    return res.status(400).json({ error: 'Invite already handled' })
  }

  if (action === 'accept') {
    const session = await Session.findById(invite.session).populate('sport')
    if (!session) {
      invite.status = 'refused'
      await user.save()
      return res.status(404).json({ error: 'Session no longer exists' })
    }

    const exists = session.participants.some((id) => id.toString() === user._id.toString())
    if (!exists) {
      if (session.participants.length >= session.sport.maxPlayers) {
        return res.status(400).json({ error: 'Session is full' })
      }
      session.participants.push(user._id)
      await session.save()
    }
    invite.status = 'accepted'
  } else {
    invite.status = 'refused'
  }

  await user.save()
  return res.json({ ok: true, status: invite.status })
})

export default router
