import { describe, it, expect, beforeEach, vi } from 'vitest';
import axios from 'axios';

// Mock API Client
class ApiClient {
  private baseURL: string;

  constructor(baseURL: string = 'http://localhost:3001') {
    this.baseURL = baseURL;
  }

  async login(tonAddress: string): Promise<{ token: string; user: unknown }> {
    try {
      const response = await axios.post(`${this.baseURL}/auth/login`, {
        tonAddress,
      });
      return response.data;
    } catch (error) {
      throw new Error('Login failed');
    }
  }

  async getUser(userId: string): Promise<unknown> {
    try {
      const response = await axios.get(`${this.baseURL}/users/${userId}`);
      return response.data;
    } catch (error) {
      throw new Error('Failed to fetch user');
    }
  }

  async createBattle(battleData: {
    name: string;
    maxPlayers: number;
  }): Promise<unknown> {
    try {
      const response = await axios.post(`${this.baseURL}/battles`, battleData);
      return response.data;
    } catch (error) {
      throw new Error('Failed to create battle');
    }
  }

  async joinBattle(battleId: string): Promise<unknown> {
    try {
      const response = await axios.post(
        `${this.baseURL}/battles/${battleId}/join`,
      );
      return response.data;
    } catch (error) {
      throw new Error('Failed to join battle');
    }
  }

  async getTokenBalance(userId: string): Promise<number> {
    try {
      const response = await axios.get(
        `${this.baseURL}/economy/balance/${userId}`,
      );
      return response.data.balance;
    } catch (error) {
      throw new Error('Failed to fetch balance');
    }
  }

  async transferTokens(toUserId: string, amount: number): Promise<unknown> {
    try {
      const response = await axios.post(`${this.baseURL}/economy/transfer`, {
        to: toUserId,
        amount,
      });
      return response.data;
    } catch (error) {
      throw new Error('Transfer failed');
    }
  }

  async getNFTs(userId: string): Promise<unknown[]> {
    try {
      const response = await axios.get(`${this.baseURL}/nft/user/${userId}`);
      return response.data;
    } catch (error) {
      throw new Error('Failed to fetch NFTs');
    }
  }
}

describe('ApiClient', () => {
  let client: ApiClient;

  beforeEach(() => {
    client = new ApiClient();
    vi.clearAllMocks();
  });

  describe('login', () => {
    it('should login user with TON address', async () => {
      const tonAddress = '0QBvzVHHvMx9vfNM-x0mVc3l...';
      const mockResponse = {
        data: {
          token: 'jwt_token_here',
          user: { id: 'user-123', tonAddress },
        },
      };

      vi.spyOn(axios, 'post').mockResolvedValueOnce(mockResponse);

      const result = await client.login(tonAddress);

      expect(result.token).toBeDefined();
      expect(result.user.tonAddress).toBe(tonAddress);
    });

    it('should throw error on login failure', async () => {
      vi.spyOn(axios, 'post').mockRejectedValueOnce(
        new Error('Network error'),
      );

      await expect(client.login('invalid')).rejects.toThrow('Login failed');
    });
  });

  describe('getUser', () => {
    it('should fetch user data', async () => {
      const userId = 'user-123';
      const mockResponse = {
        data: { id: userId, username: 'Player123', level: 10 },
      };

      vi.spyOn(axios, 'get').mockResolvedValueOnce(mockResponse);

      const result = await client.getUser(userId);

      expect(result).toHaveProperty('username');
      expect((result as any).level).toBe(10);
    });
  });

  describe('Battle Operations', () => {
    it('should create a new battle', async () => {
      const battleData = { name: 'Epic Battle', maxPlayers: 100 };
      const mockResponse = { data: { id: 'battle-1', ...battleData } };

      vi.spyOn(axios, 'post').mockResolvedValueOnce(mockResponse);

      const result = await client.createBattle(battleData);

      expect(result).toHaveProperty('id');
      expect((result as any).maxPlayers).toBe(100);
    });

    it('should join existing battle', async () => {
      const battleId = 'battle-1';
      const mockResponse = {
        data: { battleId, participantId: 'p-123', status: 'joined' },
      };

      vi.spyOn(axios, 'post').mockResolvedValueOnce(mockResponse);

      const result = await client.joinBattle(battleId);

      expect((result as any).status).toBe('joined');
    });
  });

  describe('Token Economy', () => {
    it('should fetch token balance', async () => {
      const userId = 'user-123';
      const mockResponse = { data: { balance: 1000, userId } };

      vi.spyOn(axios, 'get').mockResolvedValueOnce(mockResponse);

      const balance = await client.getTokenBalance(userId);

      expect(balance).toBe(1000);
      expect(typeof balance).toBe('number');
    });

    it('should transfer tokens', async () => {
      const mockResponse = {
        data: {
          from: 'user-123',
          to: 'user-456',
          amount: 100,
          status: 'success',
        },
      };

      vi.spyOn(axios, 'post').mockResolvedValueOnce(mockResponse);

      const result = await client.transferTokens('user-456', 100);

      expect((result as any).status).toBe('success');
      expect((result as any).amount).toBe(100);
    });

    it('should throw error on insufficient balance', async () => {
      vi.spyOn(axios, 'post').mockRejectedValueOnce(
        new Error('Insufficient balance'),
      );

      await expect(client.transferTokens('user-456', 10000)).rejects.toThrow(
        'Transfer failed',
      );
    });
  });

  describe('NFT Operations', () => {
    it('should fetch user NFTs', async () => {
      const userId = 'user-123';
      const mockResponse = {
        data: [
          { id: 'nft-1', name: 'Legendary Rifle', rarity: 'legendary' },
          { id: 'nft-2', name: 'Common Armor', rarity: 'common' },
        ],
      };

      vi.spyOn(axios, 'get').mockResolvedValueOnce(mockResponse);

      const nfts = await client.getNFTs(userId);

      expect(nfts).toHaveLength(2);
      expect(nfts[0]).toHaveProperty('rarity');
    });

    it('should handle empty NFT list', async () => {
      const userId = 'user-no-nft';
      const mockResponse = { data: [] };

      vi.spyOn(axios, 'get').mockResolvedValueOnce(mockResponse);

      const nfts = await client.getNFTs(userId);

      expect(nfts).toEqual([]);
      expect(nfts.length).toBe(0);
    });
  });
});
