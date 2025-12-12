import { Controller, Get, Post, UseGuards } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { EconomyService } from './economy.service'
import { GetUser } from '../users/users.controller'

@Controller('economy')
export class EconomyController {
  constructor(private economy: EconomyService) {}

  @Get('balance')
  @UseGuards(AuthGuard('jwt'))
  async getBalance(@GetUser() user: any) {
    return {
      balance: await this.economy.getPlayerBalance(user.id),
    }
  }
}
