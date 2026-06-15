import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Query,
} from '@nestjs/common'
import {
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger'
import { ZodSerializerDto } from 'nestjs-zod'
import { Auth } from '../../shared/decorator/auth.decorator'
import { AuthTypes } from '../../shared/constants/auth.constant'
import { UserService } from './user.service'
import {
  UserListQueryDTO,
  UserListResDTO,
} from './dto/user.dto'

@ApiTags('Users')
@Controller('users')
export class UserController {
  constructor(
    private readonly userService: UserService,
  ) {}

  @Get()
  @Auth([AuthTypes.BEARER])
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Danh sách người dùng',
  })
  @ZodSerializerDto(UserListResDTO)
  async listUsers(
    @Query() query: UserListQueryDTO,
  ) {
    return this.userService.listUsers(query)
  }
}