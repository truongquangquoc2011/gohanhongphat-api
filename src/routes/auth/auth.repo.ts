import { Injectable } from '@nestjs/common'
import { PrismaService } from '../../shared/services/prisma.service'
import { UpdateProfileBodyType } from './auth.model'

@Injectable()
export class AuthRepository {
  constructor(private readonly prismaService: PrismaService) {}

  findUserByEmail(email: string) {
    return this.prismaService.user.findUnique({
      where: { email },
    })
  }

  findUserById(id: string) {
    return this.prismaService.user.findUnique({
      where: { id },
    })
  }

  updateProfile(userId: string, data: UpdateProfileBodyType) {
    return this.prismaService.user.update({
      where: { id: userId },
      data,
    })
  }

  updatePassword(userId: string, password: string) {
    return this.prismaService.user.update({
      where: { id: userId },
      data: { password },
    })
  }

  createDevice(data: { userId: string; userAgent?: string; ip?: string }) {
    return this.prismaService.device.create({
      data: {
        userId: data.userId,
        userAgent: data.userAgent,
        ip: data.ip,
        isActive: true,
        lastActive: new Date(),
      },
    })
  }

  createRefreshToken(data: {
    userId: string
    deviceId?: string | null
    token: string
    expiresAt: Date
  }) {
    return this.prismaService.refreshToken.create({
      data,
    })
  }

  findRefreshToken(token: string) {
    return this.prismaService.refreshToken.findUnique({
      where: { token },
      include: {
        user: true,
        device: true,
      },
    })
  }

  deleteRefreshToken(token: string) {
    return this.prismaService.refreshToken.delete({
      where: { token },
    })
  }

  deleteRefreshTokensByUserId(userId: string) {
    return this.prismaService.refreshToken.deleteMany({
      where: { userId },
    })
  }
}