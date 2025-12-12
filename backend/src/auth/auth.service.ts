import { Injectable } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { PrismaService } from '../database/prisma.service'

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
  ) {}

  async validateTonWallet(address: string) {
    let user = await this.prisma.user.findUnique({
      where: { walletAddress: address },
    })

    if (!user) {
      user = await this.prisma.user.create({
        data: {
          walletAddress: address,
          displayName: `Operator_${address.slice(0, 6)}`,
          rank: 'RECRUIT',
          vityazBalance: 0,
        },
      })
    }

    const token = this.jwt.sign({
      sub: user.id,
      address: user.walletAddress,
    })

    return { user, token }
  }
}
