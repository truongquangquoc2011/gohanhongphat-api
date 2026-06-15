import { Body, Controller, Get, Ip, Patch, Post, Req } from '@nestjs/common'
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger'
import { Request } from 'express'
import { ZodSerializerDto } from 'nestjs-zod'
import { AuthTypes } from '../../shared/constants/auth.constant'
import { Auth, IsPublic } from '../../shared/decorator/auth.decorator'
import { UserAgent } from '../../shared/decorator/user-agent.decorator'
import { AccessTokenDto } from '../../shared/dto/jwt.dto'
import { AuthService } from './auth.service'
import {
  ChangePasswordBodyDTO,
  LoginBodyDTO,
  LoginResDTO,
  LogoutBodyDTO,
  MessageResDTO,
  ProfileResDTO,
  RefreshTokenBodyDTO,
  RefreshTokenResDTO,
  UpdateProfileBodyDTO,
} from './dto/auth.dto'

type RequestWithUser = Request & {
  user?: AccessTokenDto
}

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @IsPublic()
  @ZodSerializerDto(LoginResDTO)
  @ApiOperation({ summary: 'Đăng nhập hệ thống' })
  login(
    @Body() body: LoginBodyDTO,
    @UserAgent() userAgent: string,
    @Ip() ip: string,
  ) {
    return this.authService.login({
      ...body,
      userAgent,
      ip,
    })
  }

  @Post('refresh-token')
  @IsPublic()
  @ZodSerializerDto(RefreshTokenResDTO)
  @ApiOperation({ summary: 'Làm mới access token' })
  refreshToken(@Body() body: RefreshTokenBodyDTO) {
    return this.authService.refreshToken(body)
  }

  @Post('logout')
  @Auth([AuthTypes.BEARER])
  @ApiBearerAuth()
  @ZodSerializerDto(MessageResDTO)
  @ApiOperation({ summary: 'Đăng xuất' })
  logout(@Body() body: LogoutBodyDTO) {
    return this.authService.logout(body.refreshToken)
  }

  @Get('me')
  @Auth([AuthTypes.BEARER])
  @ApiBearerAuth()
  @ZodSerializerDto(ProfileResDTO)
  @ApiOperation({ summary: 'Lấy thông tin tài khoản hiện tại' })
  me(@Req() req: RequestWithUser) {
    return this.authService.getMe(req.user?.userId ?? '')
  }

  @Patch('profile')
  @Auth([AuthTypes.BEARER])
  @ApiBearerAuth()
  @ZodSerializerDto(ProfileResDTO)
  @ApiOperation({ summary: 'Cập nhật thông tin cá nhân' })
  updateProfile(
    @Req() req: RequestWithUser,
    @Body() body: UpdateProfileBodyDTO,
  ) {
    return this.authService.updateProfile(req.user?.userId ?? '', body)
  }

  @Patch('change-password')
  @Auth([AuthTypes.BEARER])
  @ApiBearerAuth()
  @ZodSerializerDto(MessageResDTO)
  @ApiOperation({ summary: 'Đổi mật khẩu' })
  changePassword(
    @Req() req: RequestWithUser,
    @Body() body: ChangePasswordBodyDTO,
  ) {
    return this.authService.changePassword(req.user?.userId ?? '', body)
  }
}