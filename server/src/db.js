import mongoose from 'mongoose'

export const connectDb = async (mongoUri) => {
  if (!mongoUri) {
    throw new Error('MONGODB_URI is required')
  }

  mongoose.set('strictQuery', true)
  await mongoose.connect(mongoUri)
}
