import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { DatabaseModule } from './database/database.module'
import { AuthModule } from './auth/auth.module'
import { UsersModule } from './users/users.module'
import { BattlesModule } from './battles/battles.module'
import { EconomyModule } from './economy/economy.module'
import { NftModule } from './nft/nft.module'
import { TournamentsModule } from './tournaments/tournaments.module'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    DatabaseModule,
    AuthModule,
    UsersModule,
    BattlesModule,
    EconomyModule,
    NftModule,
    TournamentsModule,
  ],
})
export class AppModule {}
