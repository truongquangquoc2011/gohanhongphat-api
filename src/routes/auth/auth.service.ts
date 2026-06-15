import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
  UnprocessableEntityException,
} from '@nestjs/common'
import { AccessTokenDto } from '../../shared/dto/jwt.dto'
import { HashingService } from '../../shared/services/hashing.service'
import { TokenService } from '../../shared/services/token.service'
import { AuthRepository } from './auth.repo'
import {
  ChangePasswordBodyType,
  LoginBodyType,
  RefreshTokenBodyType,
  UpdateProfileBodyType,
} from './auth.model'

@Injectable()
export class AuthService {
  constructor(
    private readonly authRepository: AuthRepository,
    private readonly hashingService: HashingService,
    private readonly tokenService: TokenService,
  ) {}

  private async generateTokens(payload: AccessTokenDto) {
    const accessToken = await this.tokenService.signAccessToken(payload)

    const refreshToken = await this.tokenService.signRefreshToken({
      userId: payload.userId,
      email: payload.email,
    })

    const decodedRefreshToken =
      await this.tokenService.verifyRefreshToken(refreshToken)

    await this.authRepository.createRefreshToken({
      userId: payload.userId,
      deviceId: payload.deviceId,
      token: refreshToken,
      expiresAt: new Date(decodedRefreshToken.exp * 1000),
    })

    return {
      accessToken,
      refreshToken,
    }
  }

  async login(body: LoginBodyType & { userAgent?: string; ip?: string }) {
    const user = await this.authRepository.findUserByEmail(body.email)

    if (!user || user.deletedAt) {
      throw new UnprocessableEntityException([
        {
          message: 'Email không tồn tại trong hệ thống',
          path: 'email',
        },
      ])
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Tài khoản đã bị khóa')
    }

    const isPasswordValid = await this.hashingService.comparePassword(
      body.password,
      user.password,
    )

    if (!isPasswordValid) {
      throw new UnprocessableEntityException([
        {
          message: 'Mật khẩu không chính xác',
          path: 'password',
        },
      ])
    }

    const device = await this.authRepository.createDevice({
      userId: user.id,
      userAgent: body.userAgent,
      ip: body.ip,
    })

    const tokens = await this.generateTokens({
      userId: user.id,
      email: user.email,
      deviceId: device.id,
    })

    return {
      ...tokens,
      userId: user.id,
      email: user.email,
      fullname: user.fullname,
    }
  }

  async refreshToken(body: RefreshTokenBodyType) {
    const storedToken = await this.authRepository.findRefreshToken(
      body.refreshToken,
    )

    if (!storedToken) {
      throw new UnauthorizedException('Refresh token không hợp lệ')
    }

    if (storedToken.expiresAt < new Date()) {
      await this.authRepository.deleteRefreshToken(body.refreshToken)
      throw new UnauthorizedException('Refresh token đã hết hạn')
    }

    const user = storedToken.user

    if (!user || user.deletedAt || !user.isActive) {
      throw new UnauthorizedException('Tài khoản không hợp lệ')
    }

    await this.authRepository.deleteRefreshToken(body.refreshToken)

    const tokens = await this.generateTokens({
      userId: user.id,
      email: user.email,
      deviceId: storedToken.deviceId ?? '',
    })

    return {
      ...tokens,
      userId: user.id,
      email: user.email,
      fullname: user.fullname,
    }
  }

  async logout(refreshToken: string) {
    const storedToken = await this.authRepository.findRefreshToken(refreshToken)

    if (!storedToken) {
      throw new UnauthorizedException('Refresh token không hợp lệ')
    }

    await this.authRepository.deleteRefreshToken(refreshToken)

    return {
      message: 'Đăng xuất thành công',
    }
  }

  async getMe(userId: string) {
    const user = await this.authRepository.findUserById(userId)

    if (!user || user.deletedAt) {
      throw new NotFoundException('Không tìm thấy tài khoản')
    }

    return {
      id: user.id,
      email: user.email,
      fullname: user.fullname,
      phoneNumber: user.phoneNumber,
      avatar: user.avatar,
      isActive: user.isActive,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    }
  }

  async updateProfile(userId: string, body: UpdateProfileBodyType) {
    const user = await this.authRepository.updateProfile(userId, body)

    return {
      id: user.id,
      email: user.email,
      fullname: user.fullname,
      phoneNumber: user.phoneNumber,
      avatar: user.avatar,
      isActive: user.isActive,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    }
  }

  async changePassword(userId: string, body: ChangePasswordBodyType) {
    const user = await this.authRepository.findUserById(userId)

    if (!user || user.deletedAt) {
      throw new NotFoundException('Không tìm thấy tài khoản')
    }

    const isOldPasswordValid = await this.hashingService.comparePassword(
      body.oldPassword,
      user.password,
    )

    if (!isOldPasswordValid) {
      throw new UnprocessableEntityException([
        {
          message: 'Mật khẩu cũ không chính xác',
          path: 'oldPassword',
        },
      ])
    }

    const hashedPassword = await this.hashingService.hashPassword(
      body.newPassword,
    )

    await this.authRepository.updatePassword(userId, hashedPassword)

    await this.authRepository.deleteRefreshTokensByUserId(userId)

    return {
      message: 'Đổi mật khẩu thành công, vui lòng đăng nhập lại',
    }
  }
}