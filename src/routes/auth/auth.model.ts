import { z } from 'zod'

export const LoginBodySchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
})

export const LoginResSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
  userId: z.string(),
  email: z.string(),
  fullname: z.string(),
})

export const RefreshTokenBodySchema = z.object({
  refreshToken: z.string(),
})

export const RefreshTokenResSchema = LoginResSchema

export const LogoutBodySchema = z.object({
  refreshToken: z.string(),
})

export const MessageResSchema = z.object({
  message: z.string(),
})

export const ProfileResSchema = z.object({
  id: z.string(),
  email: z.string(),
  fullname: z.string(),
  phoneNumber: z.string().nullable(),
  avatar: z.string().nullable(),
  isActive: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
})

export const UpdateProfileBodySchema = z.object({
  fullname: z.string().min(1).optional(),
  phoneNumber: z.string().optional(),
  avatar: z.string().optional(),
})

export const ChangePasswordBodySchema = z
  .object({
    oldPassword: z.string().min(6),
    newPassword: z.string().min(6),
    confirmPassword: z.string().min(6),
  })
  .superRefine(({ newPassword, confirmPassword }, ctx) => {
    if (newPassword !== confirmPassword) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Mật khẩu xác nhận không khớp',
        path: ['confirmPassword'],
      })
    }
  })

export type LoginBodyType = z.infer<typeof LoginBodySchema>
export type RefreshTokenBodyType = z.infer<typeof RefreshTokenBodySchema>
export type LogoutBodyType = z.infer<typeof LogoutBodySchema>
export type UpdateProfileBodyType = z.infer<typeof UpdateProfileBodySchema>
export type ChangePasswordBodyType = z.infer<typeof ChangePasswordBodySchema>