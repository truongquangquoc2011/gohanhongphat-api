import { createZodDto } from 'nestjs-zod'
import { UserListQuerySchema, UserListResSchema } from '../user.model'

export class UserListQueryDTO extends createZodDto(
  UserListQuerySchema,
) {}

export class UserListResDTO extends createZodDto(
  UserListResSchema,
) {}