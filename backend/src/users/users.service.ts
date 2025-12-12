import { Injectable } from '@nestjs/common'
import { PrismaService } from '../database/prisma.service'

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async getUserProfile(userId: string) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        battleStats: true,
        nfts: true,
      },
    })
  }

  async updateUserStats(userId: string, stats: any) {
    return this.prisma.user.update({
      where: { id: userId },
      data: stats,
    })
  }
}
