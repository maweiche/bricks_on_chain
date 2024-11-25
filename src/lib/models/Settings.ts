import mongoose from 'mongoose'

  const settingsSchema = new mongoose.Schema({
    platformName: { type: String, required: true },
    supportEmail: { type: String, required: true },
    maintenanceMode: { type: Boolean, default: false },
    minimumInvestment: { type: Number, required: true },
    maximumInvestment: { type: Number, required: true },
    platformFee: { type: Number, required: true },
    proposalDuration: { type: Number, required: true },
    minimumQuorum: { type: Number, required: true },
    votingDelay: { type: Number, required: true },
    twoFactorRequired: { type: Boolean, required: true },
    passwordExpiration: { type: Number, required: true },
    sessionTimeout: { type: Number, required: true },
    emailNotifications: { type: Boolean, required: true },
    investmentAlerts: { type: Boolean, required: true },
    proposalAlerts: { type: Boolean, required: true },
    maintenanceAlerts: { type: Boolean, required: true },
    updatedBy: { type: String, required: true }
  }, {
    timestamps: true
  })
  
  export const Settings = mongoose.models.Settings || mongoose.model('Settings', settingsSchema)