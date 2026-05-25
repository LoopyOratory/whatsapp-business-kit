import { describe, it, expect, beforeAll, mock } from 'bun:test'

// Mock database dependencies before importing catalog module
mock.module('../../database', () => ({
  db: {
    select: () => ({
      from: () => ({
        where: () => ({
          limit: () => ({
            execute: async () => [],
          }),
        }),
        innerJoin: () => ({
          where: () => ({
            limit: () => ({
              execute: async () => [],
            }),
          }),
        }),
        orderBy: () => ({
          limit: () => ({
            offset: () => ({
              execute: async () => [],
            }),
          }),
        }),
      }),
    }),
    insert: () => ({
      values: () => ({
        returning: async () => [],
      }),
    }),
    update: () => ({
      set: () => ({
        where: () => ({
          returning: async () => [],
        }),
      }),
    }),
    delete: () => ({
      where: () => ({
        returning: async () => [],
      }),
    }),
  },
}))

mock.module('../../database/schema', () => {
  const schema = {
    businesses: 'businesses_table',
    catalogItems: 'catalog_items_table',
  }
  return schema
})

mock.module('../../lib/subscription', () => ({
  checkProductLimit: async () => ({
    allowed: true,
    limit: 100,
    current: 5,
    tier: 'growth',
  }),
}))

describe('Catalog Module', () => {
  it('should export CatalogService with expected methods', async () => {
    const { CatalogService } = await import('../catalog/service')
    expect(CatalogService).toBeDefined()
    expect(typeof CatalogService.list).toBe('function')
    expect(typeof CatalogService.getById).toBe('function')
    expect(typeof CatalogService.create).toBe('function')
    expect(typeof CatalogService.update).toBe('function')
    expect(typeof CatalogService.remove).toBe('function')
    expect(typeof CatalogService.listPublic).toBe('function')
    expect(typeof CatalogService.reorder).toBe('function')
  })

  it('should export catalogModule as an Elysia instance', async () => {
    const { catalogModule } = await import('../catalog')
    expect(catalogModule).toBeDefined()
    expect(typeof catalogModule.fetch).toBe('function')
    // Elysia stores the name as Symbol('name') on the instance
    // Verify the instance has a config and routes
    expect(catalogModule.config).toBeDefined()
  })

  it('should export DTOs from model', async () => {
    const model = await import('../catalog/model')
    expect(model.CreateCatalogItemDto).toBeDefined()
    expect(model.UpdateCatalogItemDto).toBeDefined()
    expect(model.CatalogItemDto).toBeDefined()
  })

  it('should have correct route structure (prefix + routes)', async () => {
    const { catalogModule } = await import('../catalog')
    // The Elysia router stores config with prefix
    expect(catalogModule.config?.prefix).toBe('/api/catalog')
  })
})
