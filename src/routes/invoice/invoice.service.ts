import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { InvoiceRepository } from './invoice.repo'
import {
  CreateInvoiceBodyType,
  GetInvoicesQueryType,
  ReceivePaymentBodyType,
  UpdateInvoiceBodyType,
} from './invoice.model'

@Injectable()
export class InvoiceService {
  constructor(private readonly invoiceRepo: InvoiceRepository) {}

  async getAll(query: GetInvoicesQueryType) {
    return this.invoiceRepo.findAll(query)
  }

  async getById(id: string) {
    const invoice = await this.invoiceRepo.findById(id)
    if (!invoice) throw new NotFoundException('Không tìm thấy hóa đơn')
    return invoice
  }

  async create(
    body: CreateInvoiceBodyType,
    userId: string,
    userName: string,
  ) {
    if (body.code) {
      const existed = await this.invoiceRepo.findByCode(body.code)
      if (existed) {
        throw new BadRequestException('Số hóa đơn đã tồn tại')
      }
    }

    return this.invoiceRepo.create(body, userId, userName)
  }

  async update(
    id: string,
    body: UpdateInvoiceBodyType,
    userId: string,
    userName: string,
  ) {
    const invoice = await this.invoiceRepo.findById(id)
    if (!invoice) throw new NotFoundException('Không tìm thấy hóa đơn')

    if (invoice.status === 'CANCELLED') {
      throw new BadRequestException('Không thể sửa hóa đơn đã hủy')
    }

    return this.invoiceRepo.update(id, body, userId, userName)
  }

  async receivePayment(
    id: string,
    body: ReceivePaymentBodyType,
    userId: string,
    userName: string,
  ) {
    const invoice = await this.invoiceRepo.findById(id)
    if (!invoice) throw new NotFoundException('Không tìm thấy hóa đơn')

    if (invoice.status === 'CANCELLED') {
      throw new BadRequestException('Hóa đơn đã bị hủy')
    }

    if (invoice.status === 'PAID') {
      throw new BadRequestException('Hóa đơn đã thanh toán đầy đủ')
    }

    return this.invoiceRepo.receivePayment(id, body.amount)
  }

  async cancel(id: string) {
    const invoice = await this.invoiceRepo.findById(id)
    if (!invoice) throw new NotFoundException('Không tìm thấy hóa đơn')

    if (invoice.status === 'CANCELLED') {
      throw new BadRequestException('Hóa đơn đã bị hủy trước đó')
    }

    return this.invoiceRepo.cancel(id)
  }

  async delete(id: string) {
    const invoice = await this.invoiceRepo.findById(id)
    if (!invoice) throw new NotFoundException('Không tìm thấy hóa đơn')

    return this.invoiceRepo.softDelete(id)
  }
}