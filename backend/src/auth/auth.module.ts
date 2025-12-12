import { Module } from '@nestjs/common'
import { JwtModule } from '@nestjs/jwt'
import { PassportModule } from '@nestjs/passport'
import { AuthService } from './auth.service'
import { AuthController } from './auth.controller'
import { TonConnectStrategy } from './strategies/ton-connect.strategy'
import { JwtStrategy } from './strategies/jwt.strategy'
import { DatabaseModule } from '../database/database.module'

@Module({
  imports: [
    DatabaseModule,
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'test_secret',
      signOptions: { expiresIn: '7d' },
    }),
  ],
  providers: [AuthService, TonConnectStrategy, JwtStrategy],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}
