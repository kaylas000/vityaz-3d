import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { NftService } from './nft.service'
import { GetUser } from '../users/users.controller'

@Controller('nft')
export class NftController {
  constructor(private nft: NftService) {}

  @Get('inventory')
  @UseGuards(AuthGuard('jwt'))
  async getInventory(@GetUser() user: any) {
    return this.nft.getUserNFTs(user.id)
  }

  @Post('mint')
  @UseGuards(AuthGuard('jwt'))
  async mintNFT(@GetUser() user: any, @Body() dto: any) {
    return this.nft.mintNFT(user.id, dto.type, dto.data)
  }
}
