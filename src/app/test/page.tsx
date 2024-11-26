'use client'

import { useEffect } from 'react'
import { request } from 'graphql-request'

const TEST_QUERY = `
  query TestQuery {
    properties(first: 10) {
      edges {
        node {
          id
          title
        }
      }
      pageInfo {
        hasNextPage
      }
      totalCount
    }
  }
`

export default function TestPage() {
  useEffect(() => {
    const testQuery = async () => {
      try {
        const response = await request('/api/graphql', TEST_QUERY)
        console.log('Test query response:', response)
      } catch (error) {
        console.error('Test query error:', error)
      }
    }
    testQuery()
  }, [])

  return <div>Check console for test query results</div>
}
