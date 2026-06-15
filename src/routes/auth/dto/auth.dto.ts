import { createZodDto } from 'nestjs-zod'
import {
  ChangePasswordBodySchema,
  LoginBodySchema,
  LoginResSchema,
  LogoutBodySchema,
  MessageResSchema,
  ProfileResSchema,
  RefreshTokenBodySchema,
  RefreshTokenResSchema,
  UpdateProfileBodySchema,
} from '../auth.model'

export class LoginBodyDTO extends createZodDto(LoginBodySchema) {}
export class LoginResDTO extends createZodDto(LoginResSchema) {}

export class RefreshTokenBodyDTO extends createZodDto(RefreshTokenBodySchema) {}
export class RefreshTokenResDTO extends createZodDto(RefreshTokenResSchema) {}

export class LogoutBodyDTO extends createZodDto(LogoutBodySchema) {}
export class MessageResDTO extends createZodDto(MessageResSchema) {}

export class ProfileResDTO extends createZodDto(ProfileResSchema) {}
export class UpdateProfileBodyDTO extends createZodDto(UpdateProfileBodySchema) {}

export class ChangePasswordBodyDTO extends createZodDto(
  ChangePasswordBodySchema,
) {}