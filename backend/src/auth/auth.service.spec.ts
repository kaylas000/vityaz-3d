import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../database/prisma.service';

describe('AuthService', () => {
  let service: AuthService;
  let prisma: PrismaService;
  let jwt: JwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn().mockReturnValue('mock_jwt_token'),
            verify: jest.fn().mockReturnValue({ userId: '123' }),
          },
        },
        {
          provide: PrismaService,
          useValue: {
            user: {
              findUnique: jest.fn(),
              create: jest.fn(),
              update: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prisma = module.get<PrismaService>(PrismaService);
    jwt = module.get<JwtService>(JwtService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('loginWithTON', () => {
    it('should create user if not exists', async () => {
      const tonAddress = '0QBvzVHHvMx9vfNM-x0mVc3l...';
      const mockUser = { id: '123', tonAddress, username: 'User123' };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
      (prisma.user.create as jest.Mock).mockResolvedValue(mockUser);
      (jwt.sign as jest.Mock).mockReturnValue('new_token');

      const result = await service.loginWithTON(tonAddress);

      expect(result).toHaveProperty('token');
      expect(result.token).toBe('new_token');
      expect(prisma.user.create).toHaveBeenCalled();
    });

    it('should login existing user', async () => {
      const tonAddress = '0QBvzVHHvMx9vfNM-x0mVc3l...';
      const mockUser = { id: '123', tonAddress, username: 'User123' };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      (jwt.sign as jest.Mock).mockReturnValue('existing_token');

      const result = await service.loginWithTON(tonAddress);

      expect(result).toHaveProperty('token');
      expect(prisma.user.create).not.toHaveBeenCalled();
    });
  });

  describe('verifyToken', () => {
    it('should verify valid JWT', () => {
      const token = 'valid_token';
      (jwt.verify as jest.Mock).mockReturnValue({ userId: '123' });

      const result = service.verifyToken(token);

      expect(result).toEqual({ userId: '123' });
    });

    it('should throw on invalid token', () => {
      const token = 'invalid_token';
      (jwt.verify as jest.Mock).mockImplementation(() => {
        throw new Error('Invalid token');
      });

      expect(() => service.verifyToken(token)).toThrow();
    });
  });
});
