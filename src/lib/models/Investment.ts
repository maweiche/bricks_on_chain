import mongoose from 'mongoose'

  const investmentSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    propertyId: { type: String, required: true },
    amount: { type: Number, required: true },
    fractionCount: { type: Number, required: true },
    status: {
      type: String,
      enum: ['pending', 'active', 'completed'],
      default: 'pending'
    },
    purchaseDate: { type: Date, required: true },
    transactionSignature: String
  })
  
  export const Investment = mongoose.models.Investment || mongoose.model('Investment', investmentSchema)
  
