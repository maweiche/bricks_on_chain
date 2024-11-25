import { Settings } from '@/lib/models/Settings'
import { AuthenticationError, UserInputError } from 'apollo-server'
import type { Context } from '../types'
import type { Document } from 'mongoose'

interface SettingsDocument extends Document {
    platformName: string
    supportEmail: string
    maintenanceMode: boolean
    minimumInvestment: number
    maximumInvestment: number
    platformFee: number
    proposalDuration: number
    minimumQuorum: number
    votingDelay: number
    twoFactorRequired: boolean
    passwordExpiration: number
    sessionTimeout: number
    emailNotifications: boolean
    investmentAlerts: boolean
    proposalAlerts: boolean
    maintenanceAlerts: boolean
    updatedBy: string
}

interface UpdateSettingsInput {
    platformName?: string
    supportEmail?: string
    maintenanceMode?: boolean
    minimumInvestment?: number
    maximumInvestment?: number
    platformFee?: number
    proposalDuration?: number
    minimumQuorum?: number
    votingDelay?: number
    twoFactorRequired?: boolean
    passwordExpiration?: number
    sessionTimeout?: number
    emailNotifications?: boolean
    investmentAlerts?: boolean
    proposalAlerts?: boolean
    maintenanceAlerts?: boolean
}

export const typeDefs = `#graphql
    type Settings {
        platformName: String!
        supportEmail: String!
        maintenanceMode: Boolean!
        minimumInvestment: Float!
        maximumInvestment: Float!
        platformFee: Float!
        proposalDuration: Int!
        minimumQuorum: Int!
        votingDelay: Int!
        twoFactorRequired: Boolean!
        passwordExpiration: Int!
        sessionTimeout: Int!
        emailNotifications: Boolean!
        investmentAlerts: Boolean!
        proposalAlerts: Boolean!
        maintenanceAlerts: Boolean!
        updatedBy: String!
    }
`

export const resolvers = {
    Query: {
        settings: async (_parent: unknown, _args: unknown, { user }: Context): Promise<SettingsDocument> => {
            if (!user) throw new AuthenticationError('Unauthenticated')

            const settings = await Settings.findOne().exec()
            if (!settings) throw new UserInputError('Settings not found')

            return settings
        },
    },
    Mutation: {
        updateSettings: async (
            _parent: unknown,
            { input }: { input: UpdateSettingsInput },
            { user }: Context
        ): Promise<SettingsDocument> => {
            if (!user) throw new AuthenticationError('Unauthenticated')

            const settings = await Settings.findOne().exec()
            if (!settings) throw new UserInputError('Settings not found')

            Object.assign(settings, input)
            settings.updatedBy = user.id
            await settings.save()

            return settings
        },
    },
}