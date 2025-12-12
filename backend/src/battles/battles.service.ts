import { Injectable } from '@nestjs/common'
import { PrismaService } from '../database/prisma.service'

@Injectable()
export class BattlesService {
  constructor(private prisma: PrismaService) {}

  async startBattle(playerId: string) {
    return this.prisma.battle.create({
      data: {
        playerId,
        status: 'ACTIVE',
        score: 0,
      },
    })
  }

  async endBattle(battleId: string, score: number, reward: number) {
    return this.prisma.battle.update({
      where: { id: battleId },
      data: {
        status: 'COMPLETED',
        score,
        reward,
      },
    })
  }
}
