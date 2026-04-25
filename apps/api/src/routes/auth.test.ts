// src/routes/auth.test.ts
import { describe, it, beforeAll, afterAll, expect } from 'vitest'
import request from 'supertest'
import { MongoMemoryServer } from 'mongodb-memory-server'
import mongoose from 'mongoose'
import { app } from '../app'

let mongo: MongoMemoryServer

beforeAll(async () => {
  mongo = await MongoMemoryServer.create()
  const uri = mongo.getUri()
  await mongoose.connect(uri)
})

afterAll(async () => {
  await mongoose.disconnect()
  await mongo.stop()
})

describe('Auth routes', () => {
  it('registers a new user', async () => {
    const res = await request(app).post('/auth/register').send({
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123',
    })

    expect(res.status).toBe(201)
    expect(res.body.user).toBeDefined()
    expect(res.body.user.username).toBe('testuser')
  })

  it('rejects duplicate email', async () => {
    await request(app).post('/auth/register').send({
      username: 'user1',
      email: 'dup@example.com',
      password: 'password123',
    })

    const res = await request(app).post('/auth/register').send({
      username: 'user2',
      email: 'dup@example.com',
      password: 'password123',
    })

    expect(res.status).toBe(409)
  })
})
