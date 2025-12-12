import { Test, TestingModule } from '@nestjs/testing';
import { BattlesService } from './battles.service';
import { PrismaService } from '../database/prisma.service';

describe('BattlesService', () => {
  let service: BattlesService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BattlesService,
        {
          provide: PrismaService,
          useValue: {
            battle: {
              create: jest.fn(),
              findUnique: jest.fn(),
              findMany: jest.fn(),
              update: jest.fn(),
            },
            battleParticipant: {
              create: jest.fn(),
              findMany: jest.fn(),
              delete: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<BattlesService>(BattlesService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createBattle', () => {
    it('should create a new battle', async () => {
      const battleData = {
        name: 'Test Battle',
        maxPlayers: 100,
        mapId: 'map-1',
        createdBy: 'user-123',
      };

      const mockBattle = {
        id: 'battle-1',
        ...battleData,
        status: 'waiting',
        createdAt: new Date(),
      };

      (prisma.battle.create as jest.Mock).mockResolvedValue(mockBattle);

      const result = await service.createBattle(battleData);

      expect(result).toEqual(mockBattle);
      expect(prisma.battle.create).toHaveBeenCalledWith({
        data: battleData,
      });
    });
  });

  describe('joinBattle', () => {
    it('should allow player to join battle', async () => {
      const battleId = 'battle-1';
      const userId = 'user-123';

      const mockBattle = {
        id: battleId,
        maxPlayers: 100,
        status: 'waiting',
      };

      const mockParticipant = {
        id: 'participant-1',
        battleId,
        userId,
        joinedAt: new Date(),
        kills: 0,
        deaths: 0,
      };

      (prisma.battle.findUnique as jest.Mock).mockResolvedValue(mockBattle);
      (prisma.battleParticipant.create as jest.Mock).mockResolvedValue(
        mockParticipant,
      );

      const result = await service.joinBattle(battleId, userId);

      expect(result).toEqual(mockParticipant);
      expect(result.kills).toBe(0);
    });

    it('should prevent joining full battle', async () => {
      const battleId = 'battle-1';
      const userId = 'user-123';

      const mockBattle = {
        id: battleId,
        maxPlayers: 2,
        currentPlayers: 2,
        status: 'full',
      };

      (prisma.battle.findUnique as jest.Mock).mockResolvedValue(mockBattle);

      expect(() => service.joinBattle(battleId, userId)).toThrow(
        'Battle is full',
      );
    });
  });

  describe('leaveBattle', () => {
    it('should remove player from battle', async () => {
      const battleId = 'battle-1';
      const userId = 'user-123';

      (prisma.battleParticipant.delete as jest.Mock).mockResolvedValue({
        id: 'participant-1',
      });

      await service.leaveBattle(battleId, userId);

      expect(prisma.battleParticipant.delete).toHaveBeenCalled();
    });
  });

  describe('getBattleStats', () => {
    it('should return battle statistics', async () => {
      const battleId = 'battle-1';

      const mockParticipants = [
        { userId: 'user-1', kills: 10, deaths: 2 },
        { userId: 'user-2', kills: 5, deaths: 8 },
      ];

      (prisma.battleParticipant.findMany as jest.Mock).mockResolvedValue(
        mockParticipants,
      );

      const result = await service.getBattleStats(battleId);

      expect(result).toHaveLength(2);
      expect(result[0].kills).toBe(10);
    });
  });
});
