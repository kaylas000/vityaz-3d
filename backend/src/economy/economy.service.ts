import { Injectable } from '@nestjs/common'
import { PrismaService } from '../database/prisma.service'

@Injectable()
export class EconomyService {
  constructor(private prisma: PrismaService) {}

  async rewardPlayer(userId: string, amount: number, reason: string) {
    return this.prisma.user.update({
      where: { id: userId },
      data: {
        vityazBalance: {
          increment: amount,
        },
      },
    })
  }

  async getPlayerBalance(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { vityazBalance: true },
    })
    return user?.vityazBalance || 0
  }
}
