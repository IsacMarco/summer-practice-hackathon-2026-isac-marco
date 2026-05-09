import mongoose from 'mongoose'

const sessionSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      default: '',
      trim: true,
    },
    desiredPlayerLevels: {
      type: [String],
      enum: ['beginner', 'intermediate', 'advanced'],
      default: ['beginner', 'intermediate', 'advanced'],
    },
    sport: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Sport',
      required: true,
    },
    participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    captain: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'cancelled'],
      default: 'pending',
    },
    scheduledAt: { type: Date },
    location: { type: mongoose.Schema.Types.ObjectId, ref: 'Location' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    chat: { type: mongoose.Schema.Types.ObjectId, ref: 'Chat' },
  },
  { timestamps: true },
)

export default mongoose.model('Session', sessionSchema)
