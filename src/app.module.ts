import { Module } from '@nestjs/common'
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core'
import { ConfigModule } from '@nestjs/config'
import { ThrottlerModule } from '@nestjs/throttler'
import { ZodSerializerInterceptor } from 'nestjs-zod'

import { SharedModule } from './shared/shared.module'
import { AuthModule } from './routes/auth/auth.module'
import { UserModule } from './routes/user/user.module'

import CustomZodValidationPipe from './shared/pipes/custom-zod-validation.pipe'
import { HttpExceptionFilter } from './shared/filters/http-exception.filter'
import { AuthenticationGuard } from './shared/guards/authentication.guard'
import { AccessTokenGuard } from './shared/guards/access-token.guard'
import { ApiKeyGuard } from './shared/guards/api-key.guard'
import { SensitiveFieldInterceptor } from './interceptors/sensitive-field.interceptor'
import { InvoiceModule } from './routes/invoice/invoice.module';

const TIME_THROTTLER = 60
const LIMIT_THROTTLER = 20

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      ignoreEnvFile: true,
    }),

    ThrottlerModule.forRoot({
      throttlers: [
        {
          ttl: TIME_THROTTLER,
          limit: LIMIT_THROTTLER,
        },
      ],
    }),

    SharedModule,
    AuthModule,
    UserModule,
    InvoiceModule,
  ],

  controllers: [],

  providers: [
    AccessTokenGuard,
    ApiKeyGuard,

    {
      provide: APP_INTERCEPTOR,
      useClass: SensitiveFieldInterceptor,
    },

    {
      provide: APP_PIPE,
      useClass: CustomZodValidationPipe,
    },

    {
      provide: APP_GUARD,
      useClass: AuthenticationGuard,
    },

    {
      provide: APP_INTERCEPTOR,
      useClass: ZodSerializerInterceptor,
    },

    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
  ],
})
export class AppModule {}