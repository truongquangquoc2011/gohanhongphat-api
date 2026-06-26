import { createZodDto } from 'nestjs-zod'
import {
  CreateInvoiceBodySchema,
  GetInvoicesQuerySchema,
  InvoiceListResSchema,
  InvoiceResSchema,
  MessageResSchema,
  ReceivePaymentBodySchema,
  UpdateInvoiceBodySchema,
} from '../invoice.model'

export class CreateInvoiceBodyDTO extends createZodDto(CreateInvoiceBodySchema) {}
export class UpdateInvoiceBodyDTO extends createZodDto(UpdateInvoiceBodySchema) {}
export class GetInvoicesQueryDTO extends createZodDto(GetInvoicesQuerySchema) {}
export class ReceivePaymentBodyDTO extends createZodDto(ReceivePaymentBodySchema) {}
export class InvoiceResDTO extends createZodDto(InvoiceResSchema) {}
export class InvoiceListResDTO extends createZodDto(InvoiceListResSchema) {}
export class MessageResDTO extends createZodDto(MessageResSchema) {}