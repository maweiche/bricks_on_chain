import mongoose from 'mongoose'

const userSchema = new mongoose.Schema({
    address: { type: String, required: true, unique: true },
    name: String,
    email: String,
    avatar: String,
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user'
    },
    settings: {
      theme: {
        type: String,
        enum: ['light', 'dark', 'system'],
        default: 'system'
      },
      notifications: {
        email: { type: Boolean, default: true },
        push: { type: Boolean, default: true },
        investmentUpdates: { type: Boolean, default: true },
        marketingUpdates: { type: Boolean, default: false }
      },
      display: {
        compactView: { type: Boolean, default: false },
        showProfitLoss: { type: Boolean, default: true },
        currency: {
          type: String,
          enum: ['USD', 'EUR', 'GBP'],
          default: 'USD'
        }
      }
    }
  }, {
    timestamps: true
  })
  
  export const User = mongoose.models.User || mongoose.model('User', userSchema)