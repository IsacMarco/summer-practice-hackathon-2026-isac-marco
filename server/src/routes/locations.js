import express from 'express'

import { requireAdmin, requireAuth } from '../middleware/auth.js'
import Location from '../models/Location.js'
import Sport from '../models/Sport.js'

const router = express.Router()

router.get('/', async (req, res) => {
  const locations = await Location.find().populate('sports').sort({ name: 1 })
  res.json(locations)
})

router.post('/', requireAuth, requireAdmin, async (req, res) => {
  const { name, address, priceEstimate, lat, lng, sportIds } = req.body

  if (!name) {
    return res.status(400).json({ error: 'Name is required' })
  }

  const selectedSportIds = Array.isArray(sportIds)
    ? [...new Set(sportIds.map((id) => String(id)))]
    : []

  if (selectedSportIds.length > 0) {
    const sportCount = await Sport.countDocuments({ _id: { $in: selectedSportIds } })
    if (sportCount !== selectedSportIds.length) {
      return res.status(400).json({ error: 'One or more sports are invalid' })
    }
  }

  const location = await Location.create({
    name,
    address: address || '',
    priceEstimate: priceEstimate || '',
    lat,
    lng,
    sports: selectedSportIds,
  })

  const hydrated = await Location.findById(location._id).populate('sports')

  return res.status(201).json(hydrated)
})

router.delete('/:id', requireAuth, requireAdmin, async (req, res) => {
  const removed = await Location.findByIdAndDelete(req.params.id)
  if (!removed) {
    return res.status(404).json({ error: 'Location not found' })
  }

  return res.json({ ok: true })
})

export default router
