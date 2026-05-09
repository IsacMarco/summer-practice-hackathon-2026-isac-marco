import mongoose from 'mongoose'

const availabilitySchema = new mongoose.Schema(
  {
    status: {
      type: String,
      enum: ['yes', 'no'],
      default: 'no',
    },
    date: {
      type: String,
      default: '',
    },
  },
  { _id: false },
)

const userSchema = new mongoose.Schema(
  {
    firebaseUid: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    email: {
      type: String,
      required: true,
    },
    displayName: {
      type: String,
      default: '',
    },
    photoBase64: {
      type: String,
      default: '',
    },
    bio: {
      type: String,
      default: '',
    },
    skillLevel: {
      type: String,
      default: '',
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
    sports: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Sport' }],
    availability: {
      type: availabilitySchema,
      default: () => ({}),
    },
  },
  { timestamps: true },
)

export default mongoose.model('User', userSchema)
