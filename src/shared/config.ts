import { Logger } from '@nestjs/common'
import { config as loadDotenv } from 'dotenv'
import fs from 'fs'
import path from 'path'
import { z } from 'zod'

export enum Environment {
  Development = 'development',
  Production = 'production',
  Test = 'test',
  Provision = 'provision',
}

const ENV_PATH = path.resolve('.env')

const isVercel = !!process.env.VERCEL
const isProduction = process.env.NODE_ENV === Environment.Production

if (!isProduction && !isVercel) {
  if (!fs.existsSync(ENV_PATH)) {
    throw new Error(`Missing .env at ${ENV_PATH} (local dev)`)
  }

  loadDotenv({ path: ENV_PATH })
}

export const CODE_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
export const DEFAULT_LENGTH = 8
export const MAX_ATTEMPTS = 10

const EnvSchema = z.object({
  NODE_ENV: z.enum([
    Environment.Development,
    Environment.Production,
    Environment.Test,
    Environment.Provision,
  ]),

  PORT: z
    .string()
    .transform(Number)
    .refine((val) => !isNaN(val), {
      message: 'PORT must be a number',
    }),

  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),

  ACCESS_TOKEN_SECRET: z.string().min(10),
  REFRESH_TOKEN_SECRET: z.string().min(10),
  ACCESS_TOKEN_EXPIRATION: z.string(),
  REFRESH_TOKEN_EXPIRATION: z.string(),

  SALT_ROUNDS: z
    .string()
    .transform(Number)
    .refine((val) => !isNaN(val), {
      message: 'SALT_ROUNDS must be a number',
    }),

  SECRET_API_KEY: z.string().min(10),

  ADMIN_PASSWORD: z.string().min(8, {
    message: 'ADMIN_PASSWORD must be at least 8 characters long',
  }),
  ADMIN_EMAIL: z.string().email({
    message: 'ADMIN_EMAIL must be a valid email address',
  }),
  ADMIN_NAME: z.string().min(1, {
    message: 'ADMIN_NAME must not be empty',
  }),
  ADMIN_PHONE: z.string().min(1, {
    message: 'ADMIN_PHONE must not be empty',
  }),

  START_URL: z.string().url({
    message: 'START_URL must be a valid URL',
  }),

  APP_BASE_URL: z.string().url({
    message: 'APP_BASE_URL must be a valid URL',
  }),

  FRONTEND_URL: z.string().url({
    message: 'FRONTEND_URL must be a valid URL',
  }),

  SWAGGER_USERNAME: z.string().min(1, 'SWAGGER_USERNAME cannot be empty'),
  SWAGGER_PASSWORD: z
    .string()
    .min(8, 'SWAGGER_PASSWORD must be at least 8 characters'),
})

const parsedEnv = EnvSchema.safeParse(process.env)

if (!parsedEnv.success) {
  Logger.error(
    '❌ Invalid environment variables:\n' +
      JSON.stringify(parsedEnv.error.format(), null, 2),
  )
  process.exit(1)
}

export const envConfig = {
  nodeEnv: parsedEnv.data.NODE_ENV,
  port: parsedEnv.data.PORT,

  databaseUrl: parsedEnv.data.DATABASE_URL,

  accessTokenSecret: parsedEnv.data.ACCESS_TOKEN_SECRET,
  refreshTokenSecret: parsedEnv.data.REFRESH_TOKEN_SECRET,
  accessTokenExpiration: parsedEnv.data.ACCESS_TOKEN_EXPIRATION,
  refreshTokenExpiration: parsedEnv.data.REFRESH_TOKEN_EXPIRATION,

  saltRounds: parsedEnv.data.SALT_ROUNDS,
  secretApiKey: parsedEnv.data.SECRET_API_KEY,

  adminPassword: parsedEnv.data.ADMIN_PASSWORD,
  adminEmail: parsedEnv.data.ADMIN_EMAIL,
  adminName: parsedEnv.data.ADMIN_NAME,
  adminPhone: parsedEnv.data.ADMIN_PHONE,

  startUrl: parsedEnv.data.START_URL,
  appBaseUrl: parsedEnv.data.APP_BASE_URL,
  frontendUrl: parsedEnv.data.FRONTEND_URL,
}

export const ConfigGroups = {
  swagger: {
    username: parsedEnv.data.SWAGGER_USERNAME,
    password: parsedEnv.data.SWAGGER_PASSWORD,
  },
} as const

export type ConfigGroupsType = typeof ConfigGroups