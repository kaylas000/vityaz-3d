import { Module } from '@nestjs/common'
import { BattlesService } from './battles.service'
import { BattlesGateway } from './battles.gateway'
import { DatabaseModule } from '../database/database.module'

@Module({
  imports: [DatabaseModule],
  providers: [BattlesService, BattlesGateway],
})
export class BattlesModule {}
