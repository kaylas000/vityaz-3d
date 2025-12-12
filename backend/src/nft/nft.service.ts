import { Injectable } from '@nestjs/common'
import { PrismaService } from '../database/prisma.service'

@Injectable()
export class NftService {
  constructor(private prisma: PrismaService) {}

  async getUserNFTs(userId: string) {
    return this.prisma.nft.findMany({
      where: { ownerId: userId },
    })
  }

  async mintNFT(userId: string, type: string, data: any) {
    return this.prisma.nft.create({
      data: {
        ownerId: userId,
        type,
        metadata: data,
      },
    })
  }
}
