import mongoose from 'mongoose'

const locationSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    address: { type: String, default: '' },
    priceEstimate: { type: String, default: '' },
    lat: { type: Number },
    lng: { type: Number },
    sports: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Sport' }],
  },
  { timestamps: true },
)

export default mongoose.model('Location', locationSchema)
