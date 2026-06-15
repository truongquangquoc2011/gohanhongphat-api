import { PaginationQuerySchema, PaginationResBaseSchema } from '../../shared/models/pagination.model'
import z from 'zod'

export const UserItemSchema = z.object({
  id: z.string(),
  email: z.string(),
  fullname: z.string(),
  phoneNumber: z.string().nullable(),
  avatar: z.string().nullable(),
  isActive: z.boolean(),
  createdAt: z.date(),
})

export const UserListQuerySchema = PaginationQuerySchema.extend({
  search: z.string().trim().optional(),
})

export const UserListResSchema = PaginationResBaseSchema.extend({
  items: z.array(UserItemSchema),
})

export type UserItemType = z.infer<typeof UserItemSchema>
export type UserListQueryType = z.infer<typeof UserListQuerySchema>
export type UserListResType = z.infer<typeof UserListResSchema>