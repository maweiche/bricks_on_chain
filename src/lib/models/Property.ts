import mongoose from 'mongoose'

const propertySchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  location: { type: String, required: true },
  price: { type: Number, required: true },
  type: { 
    type: String, 
    enum: ['house', 'apartment', 'commercial'],
    required: true 
  },
  images: [{ type: String }],
  funded: { type: Boolean, default: false },
  fundingGoal: { type: Number, required: true },
  currentFunding: { type: Number, default: 0 },
  roi: { type: Number, required: true },
  tokenAddress: { type: String },
  mintAuthority: { type: String }
}, {
  timestamps: true
})

propertySchema.index({ type: 1 })
propertySchema.index({ price: 1 })
propertySchema.index({ location: 1 })
propertySchema.index({ roi: 1 })
propertySchema.index({ funded: 1 })
propertySchema.index({ featured: 1 })

export const Property = mongoose.models.Property || mongoose.model('Property', propertySchema)