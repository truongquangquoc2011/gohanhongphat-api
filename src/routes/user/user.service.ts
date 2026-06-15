import { Injectable } from '@nestjs/common'
import { UserRepository } from './user.repo'
import {
  UserListQueryType,
  UserListResType,
} from './user.model'

@Injectable()
export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
  ) {}

  async listUsers(
    query: UserListQueryType,
  ): Promise<UserListResType> {
    return this.userRepository.listUsers(query)
  }
}