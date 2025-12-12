import { Module } from '@nestjs/common'
import { EconomyService } from './economy.service'
import { EconomyController } from './economy.controller'
import { DatabaseModule } from '../database/database.module'

@Module({
  imports: [DatabaseModule],
  providers: [EconomyService],
  controllers: [EconomyController],
})
export class EconomyModule {}
