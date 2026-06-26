import { Injectable } from '@nestjs/common'
import { InvoiceStatus } from '@prisma/client'
import { PrismaService } from '../../shared/services/prisma.service'
import {
  CreateInvoiceBodyType,
  GetInvoicesQueryType,
  UpdateInvoiceBodyType,
} from './invoice.model'

@Injectable()
export class InvoiceRepository {
  constructor(private readonly prisma: PrismaService) {}

  private readonly notDeleted = {
    OR: [{ deletedAt: null }, { deletedAt: { isSet: false } }],
  }

  private generateCode(invoiceType: string): string {
    const now = new Date()
    const yy = String(now.getFullYear()).slice(-2)
    const rand = Math.floor(Math.random() * 900000 + 100000)

    const prefix =
      invoiceType === 'Phiếu xuất kho'
        ? 'XK'
        : invoiceType === 'Báo giá'
          ? 'BG'
          : invoiceType === 'Giấy đề nghị thanh toán'
            ? 'GDNTT'
            : 'BL'

    return `${prefix}${yy}-${rand}`
  }

  private computeStatus(
    paidValue: number,
    grandTotal: number,
  ): InvoiceStatus {
    if (paidValue <= 0) return InvoiceStatus.UNPAID
    if (paidValue >= grandTotal) return InvoiceStatus.PAID
    return InvoiceStatus.PARTIAL
  }

  async findAll(query: GetInvoicesQueryType) {
    const {
      page,
      limit,
      keyword,
      status,
      invoiceType,
      paymentMethod,
      createdById,
      fromDate,
      toDate,
      sortField,
      sortOrder,
    } = query

    const where: any = {
      OR: [{ deletedAt: null }, { deletedAt: { isSet: false } }],
    }

    if (status) where.status = status
    if (invoiceType) where.invoiceType = invoiceType
    if (paymentMethod) where.paymentMethod = paymentMethod
    if (createdById) where.createdById = createdById

    if (keyword) {
      where.AND = [
        {
          OR: [{ deletedAt: null }, { deletedAt: { isSet: false } }],
        },
        {
          OR: [
            { code: { contains: keyword, mode: 'insensitive' } },
            { customerName: { contains: keyword, mode: 'insensitive' } },
            { taxCode: { contains: keyword, mode: 'insensitive' } },
          ],
        },
      ]
      delete where.OR
    }

    if (fromDate || toDate) {
      where.invoiceDate = {}
      if (fromDate) where.invoiceDate.gte = new Date(fromDate)
      if (toDate) where.invoiceDate.lte = new Date(toDate + 'T23:59:59')
    }

    const orderBy: any = {}
    if (sortField) orderBy[sortField] = sortOrder
    else orderBy.createdAt = sortOrder

    const [data, total] = await this.prisma.$transaction([
      this.prisma.invoice.findMany({
        where,
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.invoice.count({ where }),
    ])

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) }
  }

  findById(id: string) {
    return this.prisma.invoice.findFirst({
      where: {
        id,
        OR: [{ deletedAt: null }, { deletedAt: { isSet: false } }],
      },
    })
  }

  findByCode(code: string) {
    return this.prisma.invoice.findFirst({
      where: {
        code,
        OR: [{ deletedAt: null }, { deletedAt: { isSet: false } }],
      },
    })
  }

  async create(
    body: CreateInvoiceBodyType,
    createdById: string,
    createdByName: string,
  ) {
    const subtotal = body.items.reduce((sum, item) => {
      return sum + Math.max(item.quantity * item.price - item.discount, 0)
    }, 0)

    const vatAmount = Math.round((subtotal * body.vatRate) / 100)
    const grandTotal = subtotal + vatAmount
    const debtValue = Math.max(grandTotal - body.paidValue, 0)
    const status = this.computeStatus(body.paidValue, grandTotal)
    const code = body.code || this.generateCode(body.invoiceType)

    return this.prisma.invoice.create({
      data: {
        code,
        customerName: body.customerName,
        taxCode: body.taxCode,
        buyerAddress: body.buyerAddress,
        buyerPerson: body.buyerPerson,
        phone: body.phone,
        email: body.email || undefined,
        accountNo: body.accountNo,
        invoiceDate: body.invoiceDate ? new Date(body.invoiceDate) : new Date(),
        items: body.items as any,
        subtotal,
        vatRate: body.vatRate,
        vatAmount,
        grandTotal,
        paidValue: body.paidValue,
        debtValue,
        paymentMethod: body.paymentMethod,
        invoiceType: body.invoiceType,
        invoiceNote: body.invoiceNote,
        internalNote: body.internalNote,
        status,
        sourceQuoteId: body.sourceQuoteId,
        sourceQuoteCode: body.sourceQuoteCode,
        createdById,
        createdByName,
      },
    })
  }

  async update(
    id: string,
    body: UpdateInvoiceBodyType,
    updatedById: string,
    updatedByName: string,
  ) {
    const existing = await this.findById(id)
    if (!existing) return null

    const items = body.items ?? (existing.items as any[])
    const vatRate = body.vatRate ?? existing.vatRate
    const paidValue = body.paidValue ?? existing.paidValue

    const subtotal = items.reduce((sum: number, item: any) => {
      return sum + Math.max(item.quantity * item.price - (item.discount ?? 0), 0)
    }, 0)

    const vatAmount = Math.round((subtotal * vatRate) / 100)
    const grandTotal = subtotal + vatAmount
    const debtValue = Math.max(grandTotal - paidValue, 0)
    const status = this.computeStatus(paidValue, grandTotal)

    return this.prisma.invoice.update({
      where: { id },
      data: {
        ...(body.customerName && { customerName: body.customerName }),
        ...(body.taxCode !== undefined && { taxCode: body.taxCode }),
        ...(body.buyerAddress && { buyerAddress: body.buyerAddress }),
        ...(body.buyerPerson !== undefined && { buyerPerson: body.buyerPerson }),
        ...(body.phone !== undefined && { phone: body.phone }),
        ...(body.email !== undefined && { email: body.email || null }),
        ...(body.accountNo !== undefined && { accountNo: body.accountNo }),
        ...(body.invoiceDate && { invoiceDate: new Date(body.invoiceDate) }),
        ...(body.paymentMethod && { paymentMethod: body.paymentMethod }),
        ...(body.invoiceType && { invoiceType: body.invoiceType }),
        ...(body.invoiceNote !== undefined && { invoiceNote: body.invoiceNote }),
        ...(body.internalNote !== undefined && { internalNote: body.internalNote }),
        ...(body.sourceQuoteId && { sourceQuoteId: body.sourceQuoteId }),
        ...(body.sourceQuoteCode && { sourceQuoteCode: body.sourceQuoteCode }),
        items: items as any,
        subtotal,
        vatRate,
        vatAmount,
        grandTotal,
        paidValue,
        debtValue,
        status,
        updatedById,
        updatedByName,
      },
    })
  }

  async receivePayment(id: string, amount: number) {
    const invoice = await this.findById(id)
    if (!invoice) return null

    const newPaid = Math.min(invoice.paidValue + amount, invoice.grandTotal)
    const newDebt = Math.max(invoice.grandTotal - newPaid, 0)
    const status = this.computeStatus(newPaid, invoice.grandTotal)

    return this.prisma.invoice.update({
      where: { id },
      data: { paidValue: newPaid, debtValue: newDebt, status },
    })
  }

  async cancel(id: string) {
    return this.prisma.invoice.update({
      where: { id },
      data: { status: InvoiceStatus.CANCELLED },
    })
  }

  async softDelete(id: string) {
    return this.prisma.invoice.update({
      where: { id },
      data: { deletedAt: new Date() },
    })
  }
}