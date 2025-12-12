import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { PrismaService } from './database/prisma.service'
import { AuthModule } from './auth/auth.module'
import { UsersModule } from './users/users.module'
import { EconomyModule } from './economy/economy.module'
import { BattlesModule } from './battles/battles.module'
import { NFTModule } from './nft/nft.module'
import { TournamentsModule } from './tournaments/tournaments.module'

@Module({
  imports: [
    ConfigModule.forRoot(),
    AuthModule,
    UsersModule,
    EconomyModule,
    BattlesModule,
    NFTModule,
    TournamentsModule,
  ],
  providers: [PrismaService],
})
export class AppModule {}
