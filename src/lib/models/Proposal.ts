import mongoose from 'mongoose'

const proposalSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    type: {
      type: String,
      enum: ['PROPERTY_IMPROVEMENT', 'MAINTENANCE', 'POLICY_CHANGE'],
      required: true
    },
    status: {
      type: String,
      enum: ['ACTIVE', 'PASSED', 'REJECTED', 'EXECUTED'],
      default: 'ACTIVE'
    },
    creatorId: { type: String, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    propertyId: String,
    requiredQuorum: { type: Number, required: true },
    votingPower: {
      for: { type: Number, default: 0 },
      against: { type: Number, default: 0 },
      total: { type: Number, required: true }
    },
    votes: {
      for: [String],
      against: [String]
    }
  }, {
    timestamps: true
  })
  
  export const Proposal = mongoose.models.Proposal || mongoose.model('Proposal', proposalSchema)