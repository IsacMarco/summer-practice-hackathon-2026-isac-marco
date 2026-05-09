import mongoose from 'mongoose'

const sportSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    minPlayers: {
      type: Number,
      required: true,
    },
    maxPlayers: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true },
)

export default mongoose.model('Sport', sportSchema)
