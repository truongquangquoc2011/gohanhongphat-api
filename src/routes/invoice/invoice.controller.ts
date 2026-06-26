import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
} from '@nestjs/common'
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger'
import { Request } from 'express'
import { ZodSerializerDto } from 'nestjs-zod'
import { AuthTypes } from '../../shared/constants/auth.constant'
import { Auth } from '../../shared/decorator/auth.decorator'
import { AccessTokenDto } from '../../shared/dto/jwt.dto'
import { InvoiceService } from './invoice.service'
import {
  CreateInvoiceBodyDTO,
  GetInvoicesQueryDTO,
  InvoiceListResDTO,
  InvoiceResDTO,
  MessageResDTO,
  ReceivePaymentBodyDTO,
  UpdateInvoiceBodyDTO,
} from './dto/invoice.dto'

type RequestWithUser = Request & { user?: AccessTokenDto }

@ApiTags('Invoices')
@Controller('invoices')
@Auth([AuthTypes.BEARER])
@ApiBearerAuth()
export class InvoiceController {
  constructor(private readonly invoiceService: InvoiceService) {}

  @Get()
  @ZodSerializerDto(InvoiceListResDTO)
  @ApiOperation({ summary: 'Lấy danh sách hóa đơn' })
  getAll(@Query() query: GetInvoicesQueryDTO) {
    return this.invoiceService.getAll(query)
  }

  @Get(':id')
  @ZodSerializerDto(InvoiceResDTO)
  @ApiOperation({ summary: 'Lấy chi tiết hóa đơn' })
  getById(@Param('id') id: string) {
    return this.invoiceService.getById(id)
  }

  @Post()
  @ZodSerializerDto(InvoiceResDTO)
  @ApiOperation({ summary: 'Tạo hóa đơn mới' })
  create(
    @Body() body: CreateInvoiceBodyDTO,
    @Req() req: RequestWithUser,
  ) {
    return this.invoiceService.create(
      body,
      req.user?.userId ?? '',
      req.user?.email ?? '',
    )
  }

  @Patch(':id')
  @ZodSerializerDto(InvoiceResDTO)
  @ApiOperation({ summary: 'Cập nhật hóa đơn' })
  update(
    @Param('id') id: string,
    @Body() body: UpdateInvoiceBodyDTO,
    @Req() req: RequestWithUser,
  ) {
    return this.invoiceService.update(
      id,
      body,
      req.user?.userId ?? '',
      req.user?.email ?? '',
    )
  }

  @Post(':id/payment')
  @ZodSerializerDto(InvoiceResDTO)
  @ApiOperation({ summary: 'Ghi nhận thanh toán' })
  receivePayment(
    @Param('id') id: string,
    @Body() body: ReceivePaymentBodyDTO,
    @Req() req: RequestWithUser,
  ) {
    return this.invoiceService.receivePayment(
      id,
      body,
      req.user?.userId ?? '',
      req.user?.email ?? '',
    )
  }

  @Patch(':id/cancel')
  @ZodSerializerDto(InvoiceResDTO)
  @ApiOperation({ summary: 'Hủy hóa đơn' })
  cancel(@Param('id') id: string) {
    return this.invoiceService.cancel(id)
  }

  @Delete(':id')
  @ZodSerializerDto(MessageResDTO)
  @ApiOperation({ summary: 'Xóa hóa đơn (soft delete)' })
  async delete(@Param('id') id: string) {
    await this.invoiceService.delete(id)
    return { message: 'Xóa hóa đơn thành công' }
  }
}