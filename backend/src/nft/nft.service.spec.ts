import { Test, TestingModule } from '@nestjs/testing';
import { NftService } from './nft.service';
import { PrismaService } from '../database/prisma.service';

describe('NftService', () => {
  let service: NftService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NftService,
        {
          provide: PrismaService,
          useValue: {
            nft: {
              create: jest.fn(),
              findUnique: jest.fn(),
              findMany: jest.fn(),
              update: jest.fn(),
            },
            nftListing: {
              create: jest.fn(),
              findMany: jest.fn(),
              update: jest.fn(),
              delete: jest.fn(),
            },
            user: {
              findUnique: jest.fn(),
              update: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<NftService>(NftService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('mintNFT', () => {
    it('should mint a new NFT', async () => {
      const nftData = {
        name: 'Legendary Rifle',
        type: 'weapon',
        rarity: 'legendary',
        ownerId: 'user-123',
        metadata: {
          damage: 100,
          accuracy: 95,
        },
      };

      const mockNFT = {
        id: 'nft-1',
        ...nftData,
        contractAddress: '0x...',
        tokenId: '1',
        createdAt: new Date(),
      };

      (prisma.nft.create as jest.Mock).mockResolvedValue(mockNFT);

      const result = await service.mintNFT(nftData);

      expect(result).toEqual(mockNFT);
      expect(result.rarity).toBe('legendary');
    });

    it('should assign unique token ID', async () => {
      const nftData = {
        name: 'Weapon 1',
        type: 'weapon',
        ownerId: 'user-123',
      };

      const mockNFT = { ...nftData, id: 'nft-1', tokenId: '1' };
      (prisma.nft.create as jest.Mock).mockResolvedValue(mockNFT);

      const result = await service.mintNFT(nftData);

      expect(result.tokenId).toBeDefined();
      expect(result.tokenId).toMatch(/^\d+$/);
    });
  });

  describe('transferNFT', () => {
    it('should transfer NFT to another user', async () => {
      const nftId = 'nft-1';
      const fromUserId = 'user-123';
      const toUserId = 'user-456';

      const mockNFT = {
        id: nftId,
        ownerId: fromUserId,
        name: 'Rifle',
      };

      (prisma.nft.findUnique as jest.Mock).mockResolvedValue(mockNFT);
      (prisma.nft.update as jest.Mock).mockResolvedValue({
        ...mockNFT,
        ownerId: toUserId,
      });

      const result = await service.transferNFT(nftId, fromUserId, toUserId);

      expect(result.ownerId).toBe(toUserId);
      expect(prisma.nft.update).toHaveBeenCalled();
    });

    it('should prevent transferring NFT by non-owner', async () => {
      const nftId = 'nft-1';
      const attemptedOwner = 'user-999';
      const actualOwner = 'user-123';

      const mockNFT = {
        id: nftId,
        ownerId: actualOwner,
      };

      (prisma.nft.findUnique as jest.Mock).mockResolvedValue(mockNFT);

      expect(() =>
        service.transferNFT(nftId, attemptedOwner, 'user-456'),
      ).toThrow('Only NFT owner can transfer');
    });
  });

  describe('listNFTForSale', () => {
    it('should create marketplace listing', async () => {
      const nftId = 'nft-1';
      const userId = 'user-123';
      const price = 1000;

      const mockListing = {
        id: 'listing-1',
        nftId,
        sellerId: userId,
        price,
        status: 'active',
        createdAt: new Date(),
      };

      (prisma.nftListing.create as jest.Mock).mockResolvedValue(mockListing);

      const result = await service.listNFTForSale(nftId, userId, price);

      expect(result.price).toBe(price);
      expect(result.status).toBe('active');
    });
  });

  describe('buyNFT', () => {
    it('should complete NFT purchase and transfer ownership', async () => {
      const listingId = 'listing-1';
      const buyerId = 'user-456';
      const sellerId = 'user-123';
      const price = 1000;

      const mockListing = {
        id: listingId,
        nftId: 'nft-1',
        sellerId,
        price,
        status: 'active',
      };

      const mockNFT = {
        id: 'nft-1',
        ownerId: sellerId,
      };

      (prisma.nftListing.findUnique as jest.Mock).mockResolvedValue(
        mockListing,
      );
      (prisma.nft.findUnique as jest.Mock).mockResolvedValue(mockNFT);
      (prisma.nft.update as jest.Mock).mockResolvedValue({
        ...mockNFT,
        ownerId: buyerId,
      });
      (prisma.nftListing.update as jest.Mock).mockResolvedValue({
        ...mockListing,
        status: 'sold',
      });

      const result = await service.buyNFT(listingId, buyerId, price);

      expect(result.status).toBe('sold');
      expect(prisma.nft.update).toHaveBeenCalled();
    });

    it('should prevent purchase with insufficient balance', async () => {
      const listingId = 'listing-1';
      const buyerId = 'user-456';
      const buyerBalance = 500;
      const requiredPrice = 1000;

      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: buyerId,
        balance: buyerBalance,
      });

      expect(() =>
        service.buyNFT(listingId, buyerId, requiredPrice),
      ).toThrow('Insufficient balance');
    });
  });
});
