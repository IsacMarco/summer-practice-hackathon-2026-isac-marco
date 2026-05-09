import express from 'express'

import Sport from '../models/Sport.js'

const router = express.Router()

router.get('/', async (req, res) => {
  const sports = await Sport.find().sort({ name: 1 })
  res.json(sports)
})

export default router
