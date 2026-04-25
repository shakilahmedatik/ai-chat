import { afterAll, beforeAll, vi } from 'vitest'

// If your code imports logger, we don't want noisy real logging in tests.
vi.mock('../lib/logger', () => {
  return {
    logger: {
      info: vi.fn(),
      error: vi.fn(),
      warn: vi.fn(),
      debug: vi.fn(),
    },
  }
})

// If you don't want real Redis during unit tests, you can mock it here.
// For full integration with your local/CI Redis, you can remove this mock.
vi.mock('../lib/redis', () => {
  return {
    redis: {
      // minimal interface
      isOpen: true,
      connect: vi.fn(),
      set: vi.fn(),
      get: vi.fn(),
      del: vi.fn(),
      lPush: vi.fn(),
      rPop: vi.fn(),
      ping: vi.fn().mockResolvedValue('PONG'),
    },
    setSession: vi.fn(),
    getSession: vi.fn(),
    delSession: vi.fn(),
    pushJob: vi.fn(),
    popJob: vi.fn(),
    checkRedisConnection: vi.fn().mockResolvedValue(true),
  }
})

// For Mongo: for unit tests of pure services, no setup.
// For route/integration tests, we can spin up mongodb-memory-server *per test file*
// to avoid impacting everything.

beforeAll(async () => {
  process.env.NODE_ENV = 'test'
})

afterAll(async () => {
  // clean global things if needed
})
