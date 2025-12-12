import { Module } from '@nestjs/common'
import { NftService } from './nft.service'
import { NftController } from './nft.controller'
import { DatabaseModule } from '../database/database.module'

@Module({
  imports: [DatabaseModule],
  providers: [NftService],
  controllers: [NftController],
})
export class NftModule {}
