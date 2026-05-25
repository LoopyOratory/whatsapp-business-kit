import { describe, it, expect, mock, beforeAll } from 'bun:test'

// Diagnostic test to understand mock behavior
const _mockDbState: { tierData: any[] } = {
  tierData: [],
}

mock.module('/opt/data/whatsapp-business-kit/backend/src/database', () => {
  console.log('[MOCK FACTORY CALLED]')
  return {
    db: {
      select: (_cols?: any) => {
        console.log('[MOCK select called]', _cols ? 'with cols' : 'no cols')
        return {
          from: (_table: any) => {
            console.log('[MOCK from called]')
            return {
              innerJoin: (_on: any) => {
                console.log('[MOCK innerJoin called]')
                return {
                  where: (_condition: any) => {
                    console.log('[MOCK where called (join path)]')
                    return {
                      limit: (_n: number) => {
                        console.log('[MOCK limit called]')
                        return {
                          execute: async () => {
                            console.log('[MOCK execute called - join path, returning]', _mockDbState.tierData)
                            return _mockDbState.tierData
                          },
                        }
                      },
                    }
                  },
                }
              },
              where: (_condition: any) => {
                console.log('[MOCK where called (direct path)]')
                return {
                  execute: async () => {
                    console.log('[MOCK execute called - direct path]')
                    return []
                  },
                }
              },
            }
          },
        }
      },
    },
  }
})

mock.module('/opt/data/whatsapp-business-kit/backend/src/database/index', () => {
  console.log('[MOCK FACTORY FOR /index CALLED - should not happen if /database is used]')
  throw new Error('unexpected')
})

mock.module('/opt/data/whatsapp-business-kit/backend/src/database/index.ts', () => {
  console.log('[MOCK FACTORY FOR /index.ts CALLED - should not happen if /database is used]')
  throw new Error('unexpected')
})

beforeAll(() => {
  console.log('[beforeAll]')
})

describe('Subscription module', () => {
  it('diagnostic: test mock intercepts local import', async () => {
    _mockDbState.tierData = [{ hello: 'world' }]
    
    const { getBusinessTier } = await import('../../lib/subscription')
    const result = await getBusinessTier('test-id')
    console.log('[DIAGNOSTIC] getBusinessTier returned:', JSON.stringify(result))
    // If mock works, result should NOT be null (it would be the tierData)
    // If mock doesn't work, result would be null (no DB data)
    expect(result).not.toBeNull()
  })
  
  it('should return null when business does not exist', async () => {
    _mockDbState.tierData = []
    
    const { getBusinessTier } = await import('../../lib/subscription')
    const result = await getBusinessTier('nonexistent-id')
    expect(result).toBeNull()
  })
})
