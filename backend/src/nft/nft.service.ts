import { Injectable } from '@nestjs/common'
import { PrismaService } from '../database/prisma.service'

interface NFTMetadata {
  type: 'OPERATOR' | 'WEAPON' | 'EQUIPMENT' | 'BASE' | 'BADGE'
  name: string
  rarity: 'COMMON' | 'RARE' | 'EPIC' | 'LEGENDARY'
  stats?: Record<string, number>
  dailyReward?: number
}

interface NFT {
  id: string
  tokenId: string
  owner: string
  metadata: NFTMetadata
  minted: Date
  listed: boolean
  price?: number
}

@Injectable()
export class NFTService {
  private nfts: Map<string, NFT> = new Map()
  private nextTokenId: number = 1
  private listings: Map<string, { seller: string; price: number; nftId: string }> = new Map()

  constructor(private prisma: PrismaService) {}

  /**
   * Mint new NFT
   */
  async mintNFT(
    userId: string,
    type: 'OPERATOR' | 'WEAPON' | 'EQUIPMENT' | 'BASE' | 'BADGE',
    name: string,
    rarity: 'COMMON' | 'RARE' | 'EPIC' | 'LEGENDARY',
  ): Promise<NFT> {
    // Check minting cost (tokens required)
    const mintingCost = this.getMintingCost(type, rarity)
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    })

    if (!user || user.vityazBalance < mintingCost) {
      throw new Error('Insufficient balance to mint NFT')
    }

    // Deduct minting cost
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        vityazBalance: {
          decrement: mintingCost,
        },
      },
    })

    // Generate stats based on rarity
    const stats = this.generateStats(type, rarity)

    // Create NFT
    const nft: NFT = {
      id: `nft_${userId}_${this.nextTokenId}`,
      tokenId: `0x${this.nextTokenId.toString(16)}`,
      owner: userId,
      metadata: {
        type,
        name,
        rarity,
        stats,
        dailyReward: type === 'BASE' ? this.getDailyReward(rarity) : undefined,
      },
      minted: new Date(),
      listed: false,
    }

    this.nfts.set(nft.id, nft)
    this.nextTokenId++

    return nft
  }

  /**
   * List NFT on marketplace
   */
  async listNFT(nftId: string, price: number): Promise<{ listingId: string }> {
    const nft = this.nfts.get(nftId)
    if (!nft) throw new Error('NFT not found')

    nft.listed = true
    nft.price = price

    const listingId = `listing_${nftId}_${Date.now()}`
    this.listings.set(listingId, {
      seller: nft.owner,
      price,
      nftId,
    })

    return { listingId }
  }

  /**
   * Buy NFT from marketplace
   */
  async buyNFT(listingId: string, buyerId: string): Promise<NFT> {
    const listing = this.listings.get(listingId)
    if (!listing) throw new Error('Listing not found')

    const nft = this.nfts.get(listing.nftId)
    if (!nft) throw new Error('NFT not found')

    // Check buyer balance
    const buyer = await this.prisma.user.findUnique({
      where: { id: buyerId },
    })

    if (!buyer || buyer.vityazBalance < listing.price) {
      throw new Error('Insufficient balance')
    }

    // Transfer tokens (2.5% marketplace fee)
    const marketplaceFee = Math.floor(listing.price * 0.025)
    const sellerProceeds = listing.price - marketplaceFee

    // Deduct from buyer
    await this.prisma.user.update({
      where: { id: buyerId },
      data: {
        vityazBalance: {
          decrement: listing.price,
        },
      },
    })

    // Add to seller
    await this.prisma.user.update({
      where: { id: listing.seller },
      data: {
        vityazBalance: {
          increment: sellerProceeds,
        },
      },
    })

    // Update NFT ownership
    nft.owner = buyerId
    nft.listed = false
    nft.price = undefined

    this.listings.delete(listingId)

    return nft
  }

  /**
   * Get user's NFT inventory
   */
  async getInventory(userId: string): Promise<NFT[]> {
    return Array.from(this.nfts.values()).filter((n) => n.owner === userId)
  }

  /**
   * Get marketplace listings
   */
  getMarketplace(): Array<{ listingId: string; nft: NFT; price: number }> {
    return Array.from(this.listings.entries()).map(([listingId, listing]) => ({
      listingId,
      nft: this.nfts.get(listing.nftId)!,
      price: listing.price,
    }))
  }

  /**
   * Calculate daily passive income from BASE NFTs
   */
  async calculateDailyIncome(userId: string): Promise<number> {
    const inventory = await this.getInventory(userId)
    const bases = inventory.filter((n) => n.metadata.type === 'BASE')

    return bases.reduce((sum, base) => sum + (base.metadata.dailyReward || 0), 0)
  }

  /**
   * Minting cost table
   */
  private getMintingCost(
    type: 'OPERATOR' | 'WEAPON' | 'EQUIPMENT' | 'BASE' | 'BADGE',
    rarity: 'COMMON' | 'RARE' | 'EPIC' | 'LEGENDARY',
  ): number {
    const baseCosts: Record<string, number> = {
      OPERATOR: 1000,
      WEAPON: 500,
      EQUIPMENT: 300,
      BASE: 5000,
      BADGE: 0, // Free (earned only)
    }

    const rarityMultipliers: Record<string, number> = {
      COMMON: 1,
      RARE: 2,
      EPIC: 4,
      LEGENDARY: 8,
    }

    return baseCosts[type] * rarityMultipliers[rarity]
  }

  /**
   * Generate random stats based on type and rarity
   */
  private generateStats(
    type: string,
    rarity: string,
  ): Record<string, number> {
    const baseStats: Record<string, Record<string, number>> = {
      OPERATOR: { accuracy: 50, speed: 50, endurance: 50, recoil_control: 50 },
      WEAPON: { damage_boost: 0, accuracy_boost: 0, fire_rate_boost: 0 },
      EQUIPMENT: { armor: 50, weight_penalty: 0 },
      BASE: { prestige: 0 },
    }

    const stats = baseStats[type] || {}

    // Apply rarity bonuses
    const rarityBonuses: Record<string, number> = {
      COMMON: 1,
      RARE: 1.5,
      EPIC: 2,
      LEGENDARY: 2.5,
    }

    const bonus = rarityBonuses[rarity] || 1

    for (const key in stats) {
      stats[key] = Math.floor(stats[key] * bonus)
    }

    return stats
  }

  /**
   * Get daily reward amount for BASE NFT
   */
  private getDailyReward(rarity: string): number {
    const rewards: Record<string, number> = {
      COMMON: 10,
      RARE: 50,
      EPIC: 250,
      LEGENDARY: 1000,
    }

    return rewards[rarity] || 0
  }
}
