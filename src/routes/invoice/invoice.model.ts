import { z } from 'zod'

export const InvoiceItemSchema = z.object({
  productCode: z.string().optional(),
  name: z.string().min(1),
  property: z.string().optional(),
  unit: z.string().optional(),
  quantity: z.number().int().min(1),
  price: z.number().int().min(0),
  discount: z.number().int().min(0).default(0),
})

export const CreateInvoiceBodySchema = z.object({
  code: z.string().optional(),
  customerName: z.string().min(1),
  taxCode: z.string().optional(),
  buyerAddress: z.string().min(1),
  buyerPerson: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  accountNo: z.string().optional(),
  invoiceDate: z.string().optional(),
  paymentMethod: z.enum(['Tiền mặt', 'Chuyển khoản', 'Công nợ']).optional(),
  invoiceType: z
    .enum(['Hóa đơn bán lẻ', 'Phiếu xuất kho', 'Giấy đề nghị thanh toán', 'Báo giá'])
    .default('Hóa đơn bán lẻ'),
  items: z.array(InvoiceItemSchema).min(1),
  vatRate: z.number().int().min(0).max(100).default(0),
  paidValue: z.number().int().min(0).default(0),
  invoiceNote: z.string().optional(),
  internalNote: z.string().optional(),
  sourceQuoteId: z.string().optional(),
  sourceQuoteCode: z.string().optional(),
})

export const UpdateInvoiceBodySchema = CreateInvoiceBodySchema.partial()

export const GetInvoicesQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  keyword: z.string().optional(),
  status: z
    .enum(['UNPAID', 'PARTIAL', 'PAID', 'CANCELLED'])
    .optional(),
  invoiceType: z.string().optional(),
  paymentMethod: z.string().optional(),
  createdById: z.string().optional(),
  fromDate: z.string().optional(),
  toDate: z.string().optional(),
  sortField: z.enum(['createdAt', 'invoiceDate', 'grandTotal', 'debtValue']).optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
})

export const ReceivePaymentBodySchema = z.object({
  amount: z.number().int().min(1),
  note: z.string().optional(),
})

export const InvoiceResSchema = z.object({
  id: z.string(),
  code: z.string(),
  customerName: z.string(),
  taxCode: z.string().nullable(),
  buyerAddress: z.string().nullable(),
  buyerPerson: z.string().nullable(),
  phone: z.string().nullable(),
  email: z.string().nullable(),
  accountNo: z.string().nullable(),
  invoiceDate: z.date().nullable(),
  items: z.any(),
  subtotal: z.number(),
  vatRate: z.number(),
  vatAmount: z.number(),
  grandTotal: z.number(),
  paidValue: z.number(),
  debtValue: z.number(),
  paymentMethod: z.string().nullable(),
  invoiceType: z.string().nullable(),
  invoiceNote: z.string().nullable(),
  internalNote: z.string().nullable(),
  status: z.enum(['UNPAID', 'PARTIAL', 'PAID', 'CANCELLED']),
  sourceQuoteId: z.string().nullable(),
  sourceQuoteCode: z.string().nullable(),
  createdById: z.string().nullable(),
  createdByName: z.string().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
})

export const InvoiceListResSchema = z.object({
  data: z.array(InvoiceResSchema),
  total: z.number(),
  page: z.number(),
  limit: z.number(),
  totalPages: z.number(),
})

export const MessageResSchema = z.object({
  message: z.string(),
})

export type CreateInvoiceBodyType = z.infer<typeof CreateInvoiceBodySchema>
export type UpdateInvoiceBodyType = z.infer<typeof UpdateInvoiceBodySchema>
export type GetInvoicesQueryType = z.infer<typeof GetInvoicesQuerySchema>
export type ReceivePaymentBodyType = z.infer<typeof ReceivePaymentBodySchema>
export type InvoiceItemType = z.infer<typeof InvoiceItemSchema>