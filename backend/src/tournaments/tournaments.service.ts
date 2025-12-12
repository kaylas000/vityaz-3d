import { Injectable } from '@nestjs/common'
import { PrismaService } from '../database/prisma.service'

@Injectable()
export class TournamentsService {
  constructor(private prisma: PrismaService) {}

  async getTournaments() {
    return this.prisma.tournament.findMany({
      where: { status: 'ACTIVE' },
    })
  }

  async joinTournament(userId: string, tournamentId: string) {
    return this.prisma.tournamentEntry.create({
      data: {
        userId,
        tournamentId,
      },
    })
  }
}
