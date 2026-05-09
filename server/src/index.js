import cors from 'cors'
import dotenv from 'dotenv'
import express from 'express'

import { connectDb } from './db.js'
import adminRoutes from './routes/admin.js'
import authRoutes from './routes/auth.js'
import availabilityRoutes from './routes/availability.js'
import chatRoutes from './routes/chats.js'
import locationRoutes from './routes/locations.js'
import matchRoutes from './routes/match.js'
import sessionRoutes from './routes/sessions.js'
import sportRoutes from './routes/sports.js'
import userRoutes from './routes/users.js'
import { seedLocations } from './seed/seedLocations.js'
import { seedSports } from './seed/seedSports.js'

dotenv.config()

const app = express()

app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN || '*',
    credentials: true,
  }),
)
app.use(express.json({ limit: '6mb' }))

app.get('/health', (req, res) => {
  res.json({ ok: true, timestamp: new Date().toISOString() })
})

app.use('/api/auth', authRoutes)
app.use('/api/admin', adminRoutes)
app.use('/api/availability', availabilityRoutes)
app.use('/api/chats', chatRoutes)
app.use('/api/locations', locationRoutes)
app.use('/api/match', matchRoutes)
app.use('/api/sessions', sessionRoutes)
app.use('/api/sports', sportRoutes)
app.use('/api/users', userRoutes)

const start = async () => {
  try {
    await connectDb(process.env.MONGODB_URI)
    await seedSports()
    await seedLocations()

    const port = process.env.PORT || 4000
    app.listen(port, () => {
      console.log(`API running on port ${port}`)
    })
  } catch (error) {
    console.error('Failed to start API:', error)
    process.exit(1)
  }
}

start()
