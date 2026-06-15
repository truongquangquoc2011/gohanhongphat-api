import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common'
import { map, Observable } from 'rxjs'

const SENSITIVE_KEYS = ['password', 'secret', 'apiKey', 'apiSecret']

const removeSensitiveFields = (data: unknown): unknown => {
  if (Array.isArray(data)) {
    return data.map(removeSensitiveFields)
  }

  if (data && typeof data === 'object') {
    const obj = { ...(data as Record<string, unknown>) }

    for (const key of SENSITIVE_KEYS) {
      delete obj[key]
    }

    for (const [key, value] of Object.entries(obj)) {
      obj[key] = removeSensitiveFields(value)
    }

    return obj
  }

  return data
}

@Injectable()
export class SensitiveFieldInterceptor implements NestInterceptor {
  intercept(_context: ExecutionContext, next: CallHandler): Observable<unknown> {
    return next.handle().pipe(map((data) => removeSensitiveFields(data)))
  }
}
