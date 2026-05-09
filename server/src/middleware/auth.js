import admin from 'firebase-admin'
import User from '../models/User.js'

let firebaseReady = false
let firebaseInitialized = false

const initFirebase = () => {
  if (firebaseInitialized) {
    return
  }

  firebaseInitialized = true

  const projectId = process.env.FIREBASE_PROJECT_ID
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL
  const privateKey = process.env.FIREBASE_PRIVATE_KEY

  if (projectId && clientEmail && privateKey) {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId,
        clientEmail,
        privateKey: privateKey.replace(/\\n/g, '\n'),
      }),
    })
    firebaseReady = true
  }
}

export const requireAuth = async (req, res, next) => {
  initFirebase()

  const useDevBypass = process.env.DEV_BYPASS_AUTH === 'true'
  const authHeader = req.headers.authorization || ''
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null

  if (!token) {
    if (useDevBypass) {
      req.user = { uid: req.headers['x-dev-uid'] || 'dev-user' }
      return next()
    }

    return res.status(401).json({ error: 'Missing auth token' })
  }

  if (!firebaseReady) {
    if (useDevBypass) {
      req.user = { uid: req.headers['x-dev-uid'] || 'dev-user' }
      return next()
    }

    return res.status(500).json({ error: 'Firebase admin not configured' })
  }

  try {
    const decoded = await admin.auth().verifyIdToken(token)
    req.user = decoded
    return next()
  } catch (error) {
    return res.status(401).json({ error: 'Invalid auth token' })
  }
}

export const requireAdmin = async (req, res, next) => {
  try {
    const user = await User.findOne({ firebaseUid: req.user.uid })
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin only' })
    }

    return next()
  } catch (error) {
    return res.status(500).json({ error: 'Failed to authorize admin' })
  }
}
