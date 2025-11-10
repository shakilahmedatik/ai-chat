import { describe, it, expect } from "vitest"
import { createThreadSchema } from "./schemas"

describe("createThreadSchema", () => {
  it("validates a valid thread", () => {
    const input = {
      title: "How to use React Hooks?",
      description: "I'm new to React and want to learn about hooks.",
      tags: ["react", "hooks", "javascript"],
    }
    const result = createThreadSchema.safeParse(input)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.title).toBe(input.title)
      expect(result.data.tags).toEqual(input.tags)
    }
  })

  it("rejects title that is too short", () => {
    const input = {
      title: "Hi",
      description: "Test",
      tags: [],
    }
    const result = createThreadSchema.safeParse(input)
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.errors[0].message).toContain("at least 5 characters")
    }
  })

  it("rejects title that is too long", () => {
    const input = {
      title: "a".repeat(201),
      description: "Test",
      tags: [],
    }
    const result = createThreadSchema.safeParse(input)
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.errors[0].message).toContain("less than 200 characters")
    }
  })

  it("rejects more than 5 tags", () => {
    const input = {
      title: "Valid Title Here",
      description: "Test",
      tags: ["tag1", "tag2", "tag3", "tag4", "tag5", "tag6"],
    }
    const result = createThreadSchema.safeParse(input)
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.errors[0].message).toContain("up to 5 tags")
    }
  })

  it("removes duplicate tags", () => {
    const input = {
      title: "Valid Title Here",
      description: "Test",
      tags: ["react", "react", "javascript"],
    }
    const result = createThreadSchema.safeParse(input)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.tags.length).toBe(2)
      expect(new Set(result.data.tags).size).toBe(2)
    }
  })

  it("requires a title", () => {
    const input = {
      title: "",
      description: "Test",
      tags: [],
    }
    const result = createThreadSchema.safeParse(input)
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.errors[0].message).toContain("required")
    }
  })

  it("trims whitespace from tags and description", () => {
    const input = {
      title: "Valid Title Here",
      description: "  Text with spaces  ",
      tags: ["  tag1  ", "  tag2  "],
    }
    const result = createThreadSchema.safeParse(input)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.description).toBe("Text with spaces")
    }
  })

  it("handles optional description", () => {
    const input = {
      title: "Valid Title Here",
      tags: [],
    }
    const result = createThreadSchema.safeParse(input)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.description).toBe("")
    }
  })
})
