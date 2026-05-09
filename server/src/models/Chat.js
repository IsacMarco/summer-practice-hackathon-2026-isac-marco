import mongoose from 'mongoose'

const messageSchema = new mongoose.Schema(
  {
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    text: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
  },
  { _id: false },
)

const chatSchema = new mongoose.Schema(
  {
    session: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Session',
      required: true,
      unique: true,
    },
    messages: [messageSchema],
  },
  { timestamps: true },
)

export default mongoose.model('Chat', chatSchema)
