import express from 'express'

import { requireAdmin, requireAuth } from '../middleware/auth.js'
import Location from '../models/Location.js'

const router = express.Router()

router.get('/', async (req, res) => {
  const locations = await Location.find().sort({ name: 1 })
  res.json(locations)
})

router.post('/', requireAuth, requireAdmin, async (req, res) => {
  const { name, address, priceEstimate, lat, lng } = req.body

  if (!name) {
    return res.status(400).json({ error: 'Name is required' })
  }

  const location = await Location.create({
    name,
    address: address || '',
    priceEstimate: priceEstimate || '',
    lat,
    lng,
  })

  return res.status(201).json(location)
})

router.delete('/:id', requireAuth, requireAdmin, async (req, res) => {
  const removed = await Location.findByIdAndDelete(req.params.id)
  if (!removed) {
    return res.status(404).json({ error: 'Location not found' })
  }

  return res.json({ ok: true })
})

export default router
