import { Test, TestingModule } from '@nestjs/testing';
import { EconomyService } from './economy.service';
import { PrismaService } from '../prisma/prisma.service';

describe('EconomyService', () => {
  let service: EconomyService;
  let prisma: PrismaService;

  const mockPrismaService = {
    user: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    transaction: {
      create: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EconomyService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<EconomyService>(EconomyService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('rewardPlayer', () => {
    it('should add tokens to player balance', async () => {
      const mockUser = { id: '1', balance: 100 };
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockPrismaService.user.update.mockResolvedValue({ ...mockUser, balance: 150 });

      const result = await service.rewardPlayer('1', 50);

      expect(result.balance).toBe(150);
      expect(mockPrismaService.user.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: { balance: 150 },
      });
    });
  });

  describe('transferTokens', () => {
    it('should transfer tokens between users', async () => {
      const sender = { id: '1', balance: 100 };
      const receiver = { id: '2', balance: 50 };

      mockPrismaService.user.findUnique
        .mockResolvedValueOnce(sender)
        .mockResolvedValueOnce(receiver);

      await service.transferTokens('1', '2', 30);

      expect(mockPrismaService.user.update).toHaveBeenCalledTimes(2);
    });

    it('should throw error if insufficient balance', async () => {
      const sender = { id: '1', balance: 10 };
      mockPrismaService.user.findUnique.mockResolvedValue(sender);

      await expect(service.transferTokens('1', '2', 50)).rejects.toThrow();
    });
  });

  describe('calculateStakingReward', () => {
    it('should calculate reward based on amount and duration', () => {
      const reward = service.calculateStakingReward(1000, 30); // 1000 tokens, 30 days
      expect(reward).toBeGreaterThan(0);
    });

    it('should return higher rewards for longer durations', () => {
      const shortReward = service.calculateStakingReward(1000, 7);
      const longReward = service.calculateStakingReward(1000, 90);
      expect(longReward).toBeGreaterThan(shortReward);
    });
  });

  describe('burnTokens', () => {
    it('should reduce user balance', async () => {
      const mockUser = { id: '1', balance: 100 };
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockPrismaService.user.update.mockResolvedValue({ ...mockUser, balance: 70 });

      await service.burnTokens('1', 30);

      expect(mockPrismaService.user.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: { balance: 70 },
      });
    });
  });
});
