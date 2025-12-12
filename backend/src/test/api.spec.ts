import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { UserController } from '../controllers/user.controller';
import { BattleController } from '../controllers/battle.controller';
import { TokenController } from '../controllers/token.controller';
import { AuthService } from '../services/auth.service';
import { UserService } from '../services/user.service';
import { BattleService } from '../services/battle.service';
import { TokenService } from '../services/token.service';

describe('API Endpoints', () => {
  let app: INestApplication;
  let userService: UserService;
  let battleService: BattleService;
  let tokenService: TokenService;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [UserController, BattleController, TokenController],
      providers: [
        {
          provide: UserService,
          useValue: {
            findById: jest.fn(),
            getProfile: jest.fn(),
            updateProfile: jest.fn(),
          },
        },
        {
          provide: BattleService,
          useValue: {
            createBattle: jest.fn(),
            joinBattle: jest.fn(),
            endBattle: jest.fn(),
            getActiveGames: jest.fn(),
          },
        },
        {
          provide: TokenService,
          useValue: {
            transfer: jest.fn(),
            getBalance: jest.fn(),
            stake: jest.fn(),
          },
        },
        AuthService,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    userService = moduleFixture.get<UserService>(UserService);
    battleService = moduleFixture.get<BattleService>(BattleService);
    tokenService = moduleFixture.get<TokenService>(TokenService);
  });

  afterEach(async () => {
    await app.close();
  });

  describe('Authentication Endpoints', () => {
    it('POST /auth/login - should authenticate user with TON', async () => {
      const tonAddress = 'UQ...';

      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ tonAddress })
        .expect(200);

      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('user');
    });

    it('POST /auth/verify - should verify JWT token', async () => {
      const token = 'valid.jwt.token';

      const response = await request(app.getHttpServer())
        .post('/auth/verify')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body).toHaveProperty('valid', true);
    });

    it('POST /auth/logout - should logout user', async () => {
      const token = 'valid.jwt.token';

      await request(app.getHttpServer())
        .post('/auth/logout')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);
    });
  });

  describe('User Endpoints', () => {
    it('GET /users/:id - should get user profile', async () => {
      const userId = 'user123';
      (userService.getProfile as jest.Mock).mockResolvedValue({
        id: userId,
        username: 'player1',
        level: 5,
        xp: 1500,
      });

      const response = await request(app.getHttpServer())
        .get(`/users/${userId}`)
        .expect(200);

      expect(response.body).toHaveProperty('username');
      expect(response.body.id).toBe(userId);
    });

    it('PATCH /users/:id - should update user profile', async () => {
      const userId = 'user123';
      const updates = { username: 'newname' };

      (userService.updateProfile as jest.Mock).mockResolvedValue({
        id: userId,
        username: 'newname',
      });

      const response = await request(app.getHttpServer())
        .patch(`/users/${userId}`)
        .set('Authorization', 'Bearer token')
        .send(updates)
        .expect(200);

      expect(response.body.username).toBe('newname');
    });

    it('GET /users/:id/stats - should get user statistics', async () => {
      const userId = 'user123';

      const response = await request(app.getHttpServer())
        .get(`/users/${userId}/stats`)
        .expect(200);

      expect(response.body).toHaveProperty('kills');
      expect(response.body).toHaveProperty('deaths');
      expect(response.body).toHaveProperty('wins');
    });

    it('GET /users/:id/nfts - should get user NFTs', async () => {
      const userId = 'user123';

      const response = await request(app.getHttpServer())
        .get(`/users/${userId}/nfts`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });

    it('GET /leaderboard - should get global leaderboard', async () => {
      const response = await request(app.getHttpServer())
        .get('/leaderboard')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
    });
  });

  describe('Battle Endpoints', () => {
    it('POST /battles - should create new battle', async () => {
      const battleData = {
        type: 'deathmatch',
        maxPlayers: 10,
        mapId: 'map1',
      };

      (battleService.createBattle as jest.Mock).mockResolvedValue({
        id: 'battle123',
        ...battleData,
        status: 'waiting',
      });

      const response = await request(app.getHttpServer())
        .post('/battles')
        .set('Authorization', 'Bearer token')
        .send(battleData)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.type).toBe('deathmatch');
    });

    it('GET /battles/:id - should get battle details', async () => {
      const battleId = 'battle123';

      const response = await request(app.getHttpServer())
        .get(`/battles/${battleId}`)
        .expect(200);

      expect(response.body).toHaveProperty('id', battleId);
      expect(response.body).toHaveProperty('players');
    });

    it('POST /battles/:id/join - should join battle', async () => {
      const battleId = 'battle123';
      const userId = 'user123';

      (battleService.joinBattle as jest.Mock).mockResolvedValue({
        battleId,
        userId,
        team: 'red',
      });

      const response = await request(app.getHttpServer())
        .post(`/battles/${battleId}/join`)
        .set('Authorization', 'Bearer token')
        .expect(200);

      expect(response.body).toHaveProperty('team');
    });

    it('POST /battles/:id/leave - should leave battle', async () => {
      const battleId = 'battle123';

      await request(app.getHttpServer())
        .post(`/battles/${battleId}/leave`)
        .set('Authorization', 'Bearer token')
        .expect(200);
    });

    it('POST /battles/:id/end - should end battle', async () => {
      const battleId = 'battle123';
      const results = {
        winner: 'red',
        redScore: 100,
        blueScore: 80,
      };

      (battleService.endBattle as jest.Mock).mockResolvedValue({
        battleId,
        ...results,
      });

      const response = await request(app.getHttpServer())
        .post(`/battles/${battleId}/end`)
        .set('Authorization', 'Bearer token')
        .send(results)
        .expect(200);

      expect(response.body.winner).toBe('red');
    });

    it('GET /battles/active - should get active battles', async () => {
      (battleService.getActiveGames as jest.Mock).mockResolvedValue([
        { id: 'battle1', type: 'deathmatch', players: 5 },
        { id: 'battle2', type: 'tdm', players: 8 },
      ]);

      const response = await request(app.getHttpServer())
        .get('/battles/active')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
    });
  });

  describe('Token/Economy Endpoints', () => {
    it('GET /balance - should get user balance', async () => {
      (tokenService.getBalance as jest.Mock).mockResolvedValue(1000);

      const response = await request(app.getHttpServer())
        .get('/balance')
        .set('Authorization', 'Bearer token')
        .expect(200);

      expect(response.body).toHaveProperty('balance', 1000);
    });

    it('POST /transfer - should transfer tokens', async () => {
      const transferData = {
        toUserId: 'user456',
        amount: 100,
      };

      (tokenService.transfer as jest.Mock).mockResolvedValue({
        success: true,
        transaction: { id: 'tx123', ...transferData },
      });

      const response = await request(app.getHttpServer())
        .post('/transfer')
        .set('Authorization', 'Bearer token')
        .send(transferData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.transaction).toHaveProperty('id');
    });

    it('POST /stake - should stake tokens', async () => {
      const stakeData = {
        amount: 500,
        days: 30,
      };

      (tokenService.stake as jest.Mock).mockResolvedValue({
        stakeId: 'stake123',
        ...stakeData,
        apy: 0.50,
      });

      const response = await request(app.getHttpServer())
        .post('/stake')
        .set('Authorization', 'Bearer token')
        .send(stakeData)
        .expect(200);

      expect(response.body).toHaveProperty('stakeId');
      expect(response.body.apy).toBe(0.50);
    });

    it('GET /transactions - should get transaction history', async () => {
      const response = await request(app.getHttpServer())
        .get('/transactions')
        .set('Authorization', 'Bearer token')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe('NFT/Marketplace Endpoints', () => {
    it('GET /nfts - should list available NFTs', async () => {
      const response = await request(app.getHttpServer())
        .get('/nfts')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });

    it('POST /nfts/mint - should mint NFT', async () => {
      const mintData = {
        itemType: 'weapon_skin',
        rarity: 'rare',
      };

      const response = await request(app.getHttpServer())
        .post('/nfts/mint')
        .set('Authorization', 'Bearer token')
        .send(mintData)
        .expect(201);

      expect(response.body).toHaveProperty('nftId');
      expect(response.body).toHaveProperty('address');
    });

    it('POST /marketplace/list - should list NFT for sale', async () => {
      const listData = {
        nftId: 'nft123',
        price: 1000,
      };

      const response = await request(app.getHttpServer())
        .post('/marketplace/list')
        .set('Authorization', 'Bearer token')
        .send(listData)
        .expect(201);

      expect(response.body).toHaveProperty('listingId');
    });

    it('POST /marketplace/buy - should buy NFT from marketplace', async () => {
      const buyData = {
        listingId: 'listing123',
      };

      const response = await request(app.getHttpServer())
        .post('/marketplace/buy')
        .set('Authorization', 'Bearer token')
        .send(buyData)
        .expect(200);

      expect(response.body.success).toBe(true);
    });
  });

  describe('Error Handling', () => {
    it('should return 400 for invalid request', async () => {
      const response = await request(app.getHttpServer())
        .post('/battles')
        .send({ invalid: 'data' })
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    it('should return 401 for unauthorized access', async () => {
      const response = await request(app.getHttpServer())
        .get('/balance')
        .expect(401);

      expect(response.body).toHaveProperty('error');
    });

    it('should return 404 for not found resources', async () => {
      const response = await request(app.getHttpServer())
        .get('/battles/nonexistent')
        .expect(404);

      expect(response.body).toHaveProperty('error');
    });

    it('should return 500 for server errors with proper message', async () => {
      (userService.getProfile as jest.Mock).mockRejectedValue(
        new Error('Database error')
      );

      const response = await request(app.getHttpServer())
        .get('/users/test')
        .expect(500);

      expect(response.body).toHaveProperty('error');
    });
  });
});
