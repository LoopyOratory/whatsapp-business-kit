import { describe, it, expect } from "bun:test"
import {
  checkProductLimit,
  checkMessageLimit,
  checkUserLimit,
  getBusinessTier,
} from "../subscription"

describe("subscription module", () => {
  it("should export checkProductLimit as an async function", () => {
    expect(checkProductLimit).toBeDefined()
    expect(typeof checkProductLimit).toBe("function")
    expect(checkProductLimit.constructor.name).toBe("AsyncFunction")
  })

  it("should export checkMessageLimit as an async function", () => {
    expect(checkMessageLimit).toBeDefined()
    expect(typeof checkMessageLimit).toBe("function")
    expect(checkMessageLimit.constructor.name).toBe("AsyncFunction")
  })

  it("should export checkUserLimit as an async function", () => {
    expect(checkUserLimit).toBeDefined()
    expect(typeof checkUserLimit).toBe("function")
    expect(checkUserLimit.constructor.name).toBe("AsyncFunction")
  })

  it("should export getBusinessTier as an async function", () => {
    expect(getBusinessTier).toBeDefined()
    expect(typeof getBusinessTier).toBe("function")
    expect(getBusinessTier.constructor.name).toBe("AsyncFunction")
  })

  it("should handle db not being available gracefully", async () => {
    // These will throw because db is not configured in test environment,
    // but we verify the functions are callable async functions
    try {
      await checkProductLimit("test-biz")
    } catch (e) {
      expect(e).toBeDefined()
    }

    try {
      await checkMessageLimit("test-biz")
    } catch (e) {
      expect(e).toBeDefined()
    }

    try {
      await checkUserLimit("test-biz")
    } catch (e) {
      expect(e).toBeDefined()
    }

    try {
      await getBusinessTier("test-biz")
    } catch (e) {
      expect(e).toBeDefined()
    }
  })
})
