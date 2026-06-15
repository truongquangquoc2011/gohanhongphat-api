import { Injectable } from '@nestjs/common'
import { PrismaService } from '../../shared/services/prisma.service'
import {
  UserListQueryType,
  UserListResType,
} from './user.model'
import { Prisma } from '@prisma/client'
@Injectable()
export class UserRepository {
  constructor(
    private readonly prismaService: PrismaService,
  ) {}

  async listUsers(
    query: UserListQueryType,
  ): Promise<UserListResType> {
    const where = {
      deletedAt: null,
      ...(query.search
        ? {
            OR: [
              {
                fullname: {
                  contains: query.search,
                  mode: Prisma.QueryMode.insensitive
                },
              },
              {
                email: {
                  contains: query.search,
                  mode: Prisma.QueryMode.insensitive
                },
              },
            ],
          }
        : {}),
    }

    const [items, total] =
      await this.prismaService.$transaction([
        this.prismaService.user.findMany({
          where,
          select: {
            id: true,
            email: true,
            fullname: true,
            phoneNumber: true,
            avatar: true,
            isActive: true,
            createdAt: true,
          },
          orderBy: {
            createdAt: 'desc',
          },
          skip: query.skip,
          take: query.take,
        }),
        this.prismaService.user.count({
          where,
        }),
      ])

    return {
      items,
      total,
      skip: query.skip,
      take: query.take,
    }
  }
}