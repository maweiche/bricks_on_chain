// src/lib/apollo/graphql/queries/settings.ts

import { gql } from 'graphql-tag'

export const GET_PLATFORM_SETTINGS = gql`
  query GetPlatformSettings {
    platformSettings {
      platformName
      supportEmail
      maintenanceMode
      minimumInvestment
      maximumInvestment
      platformFee
      proposalDuration
      minimumQuorum
      votingDelay
      twoFactorRequired
      passwordExpiration
      sessionTimeout
      emailNotifications
      investmentAlerts
      proposalAlerts
      maintenanceAlerts
      updatedAt
      updatedBy {
        id
        name
      }
    }
  }
`