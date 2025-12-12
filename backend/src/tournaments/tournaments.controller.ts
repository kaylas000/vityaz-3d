import { Controller, Get, Post, Param, UseGuards } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { TournamentsService } from './tournaments.service'
import { GetUser } from '../users/users.controller'

@Controller('tournaments')
export class TournamentsController {
  constructor(private tournaments: TournamentsService) {}

  @Get()
  async getTournaments() {
    return this.tournaments.getTournaments()
  }

  @Post(':id/join')
  @UseGuards(AuthGuard('jwt'))
  async joinTournament(@Param('id') id: string, @GetUser() user: any) {
    return this.tournaments.joinTournament(user.id, id)
  }
}
