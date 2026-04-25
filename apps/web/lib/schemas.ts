import { z } from "zod"

export const createThreadSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .min(5, "Title must be at least 5 characters")
    .max(200, "Title must be less than 200 characters"),
  description: z
    .string()
    .max(2000, "Description must be less than 2000 characters")
    .optional()
    .transform((val) => val?.trim() || ""),
  tags: z
    .array(z.string().trim().min(1))
    .max(5, "You can add up to 5 tags")
    .default([])
    .transform((tags) => [...new Set(tags)]), // Remove duplicates
})

export type CreateThreadInput = z.infer<typeof createThreadSchema>

export const profileSchema = z.object({
  displayName: z
    .string()
    .min(1, "Display name is required")
    .min(2, "Display name must be at least 2 characters")
    .max(50, "Display name must be less than 50 characters"),
  bio: z
    .string()
    .max(500, "Bio must be less than 500 characters")
    .optional()
    .transform((val) => val?.trim() || ""),
})

export type ProfileInput = z.infer<typeof profileSchema>

export const settingsSchema = z.object({
  emailNotifications: z.boolean().default(true),
  inAppNotifications: z.boolean().default(true),
  language: z.enum(["en", "bn"]).default("en"),
})

export type SettingsInput = z.infer<typeof settingsSchema>

export const webhookSchema = z.object({
  targetUrl: z
    .string()
    .min(1, "Target URL is required")
    .url("Must be a valid URL")
    .startsWith("https://", "URL must use HTTPS"),
  events: z.array(z.enum(["mention", "reply", "digest"])).min(1, "Select at least one event type"),
  secret: z
    .string()
    .min(8, "Secret must be at least 8 characters")
    .optional()
    .default(() => Math.random().toString(36).slice(2, 10)),
})

export type WebhookInput = z.infer<typeof webhookSchema>

export const loginSchema = z.object({
  emailOrUsername: z
    .string()
    .min(1, "Email or username is required")
    .refine(
      (value) => (value.includes("@") ? z.string().email().safeParse(value).success : value.length >= 3),
      "Enter a valid email or username (min 3 characters)",
    ),
  password: z.string().min(1, "Password is required").min(6, "Password must be at least 6 characters"),
  rememberMe: z.boolean().default(false),
})

export type LoginInput = z.infer<typeof loginSchema>

export const registerSchema = z
  .object({
    username: z
      .string()
      .min(1, "Username is required")
      .min(3, "Username must be at least 3 characters")
      .max(20, "Username must be less than 20 characters")
      .regex(/^[a-zA-Z0-9_-]+$/, "Username can only contain letters, numbers, underscores, and hyphens"),
    email: z.string().min(1, "Email is required").email("Enter a valid email address"),
    password: z
      .string()
      .min(1, "Password is required")
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/[0-9]/, "Password must contain at least one number"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  })

export type RegisterInput = z.infer<typeof registerSchema>
