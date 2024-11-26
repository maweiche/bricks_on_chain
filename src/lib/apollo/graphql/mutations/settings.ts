import { gql } from 'graphql-tag'

export const UPDATE_PLATFORM_SETTINGS = gql`
  mutation UpdatePlatformSettings($input: UpdateSettingsInput!) {
    updatePlatformSettings(input: $input) {
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
