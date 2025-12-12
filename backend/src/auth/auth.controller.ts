import { Controller, Post, Body } from '@nestjs/common'
import { AuthService } from './auth.service'

@Controller('auth')
export class AuthController {
  constructor(private auth: AuthService) {}

  @Post('ton-login')
  async tonLogin(@Body() dto: { address: string }) {
    return this.auth.validateTonWallet(dto.address)
  }
}
