import { Injectable, Logger, BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';

export enum ClanRole {
  LEADER = 'leader',
  OFFICER = 'officer',
  MEMBER = 'member',
  RECRUIT = 'recruit',
}

export interface ClanMember {
  playerId: string;
  playerName: string;
  role: ClanRole;
  joinedAt: number;
  contributions: number; // XP/currency contributed
  stats: {
    wins: number;
    losses: number;
    kills: number;
    deaths: number;
  };
}

export interface Clan {
  id: string;
  name: string;
  description: string;
  tag: string; // 2-4 character clan tag
  level: number;
  experience: number;
  members: Map<string, ClanMember>;
  maxMembers: number;
  treasury: number; // Clan currency/gold
  isOpen: boolean; // Can join without invite
  founded: number;
  leader: string; // Player ID
}

export interface ClanWar {
  id: string;
  clan1Id: string;
  clan2Id: string;
  startTime: number;
  endTime?: number;
  clan1Score: number;
  clan2Score: number;
  status: 'scheduled' | 'ongoing' | 'completed';
  prize: number;
}

export interface ClanTech {
  id: string;
  name: string;
  description: string;
  cost: number; // Clan gold
  level: number;
  maxLevel: number;
  bonus: Record<string, number>; // What stat it improves
}

@Injectable()
export class ClanService {
  private readonly logger = new Logger(ClanService.name);
  private clans: Map<string, Clan> = new Map();
  private clanWars: Map<string, ClanWar> = new Map();
  private playerClans: Map<string, string> = new Map(); // playerId -> clanId
  private clanTechs: Map<string, ClanTech[]> = new Map(); // clanId -> tech array

  constructor() {
    this.initializeTechTree();
  }

  /**
   * Create new clan
   */
  createClan(name: string, tag: string, leaderId: string, description: string = ''): Clan {
    // Validate inputs
    if (name.length < 3 || name.length > 50) {
      throw new BadRequestException('Clan name must be 3-50 characters');
    }
    if (tag.length < 2 || tag.length > 4) {
      throw new BadRequestException('Clan tag must be 2-4 characters');
    }

    // Check if player already in a clan
    if (this.playerClans.has(leaderId)) {
      throw new BadRequestException('Player already in a clan');
    }

    // Check if tag is unique
    const existingTag = Array.from(this.clans.values()).some((c) => c.tag.toUpperCase() === tag.toUpperCase());
    if (existingTag) {
      throw new BadRequestException('Clan tag already exists');
    }

    const clanId = uuidv4();
    const leader: ClanMember = {
      playerId: leaderId,
      playerName: `Player_${leaderId.substring(0, 8)}`,
      role: ClanRole.LEADER,
      joinedAt: Date.now(),
      contributions: 0,
      stats: { wins: 0, losses: 0, kills: 0, deaths: 0 },
    };

    const clan: Clan = {
      id: clanId,
      name,
      description,
      tag: tag.toUpperCase(),
      level: 1,
      experience: 0,
      members: new Map([[leaderId, leader]]),
      maxMembers: 50,
      treasury: 0,
      isOpen: false,
      founded: Date.now(),
      leader: leaderId,
    };

    this.clans.set(clanId, clan);
    this.playerClans.set(leaderId, clanId);
    this.clanTechs.set(clanId, []);

    this.logger.log(`Clan created: ${name} (${clanId}) by ${leaderId}`);
    return clan;
  }

  /**
   * Join clan
   */
  joinClan(clanId: string, playerId: string, isInvite: boolean = false): ClanMember {
    const clan = this.clans.get(clanId);
    if (!clan) {
      throw new NotFoundException(`Clan ${clanId} not found`);
    }

    if (clan.members.size >= clan.maxMembers) {
      throw new BadRequestException('Clan is full');
    }

    if (!isInvite && !clan.isOpen) {
      throw new BadRequestException('Clan is not open for public join');
    }

    if (this.playerClans.has(playerId)) {
      throw new BadRequestException('Player already in a clan');
    }

    const member: ClanMember = {
      playerId,
      playerName: `Player_${playerId.substring(0, 8)}`,
      role: ClanRole.RECRUIT,
      joinedAt: Date.now(),
      contributions: 0,
      stats: { wins: 0, losses: 0, kills: 0, deaths: 0 },
    };

    clan.members.set(playerId, member);
    this.playerClans.set(playerId, clanId);

    this.logger.log(`Player ${playerId} joined clan ${clanId}`);
    return member;
  }

  /**
   * Leave clan
   */
  leaveClan(playerId: string): void {
    const clanId = this.playerClans.get(playerId);
    if (!clanId) {
      throw new BadRequestException('Player not in a clan');
    }

    const clan = this.clans.get(clanId);
    if (!clan) {
      throw new NotFoundException(`Clan ${clanId} not found`);
    }

    // Cannot leave as leader
    const member = clan.members.get(playerId);
    if (member?.role === ClanRole.LEADER) {
      throw new ForbiddenException('Leader cannot leave clan. Transfer leadership first.');
    }

    clan.members.delete(playerId);
    this.playerClans.delete(playerId);

    this.logger.log(`Player ${playerId} left clan ${clanId}`);
  }

  /**
   * Update member role
   */
  updateMemberRole(clanId: string, playerId: string, newRole: ClanRole, performedBy: string): void {
    const clan = this.clans.get(clanId);
    if (!clan) {
      throw new NotFoundException(`Clan ${clanId} not found`);
    }

    // Only leader/officers can change roles
    const performer = clan.members.get(performedBy);
    if (!performer || ![ClanRole.LEADER, ClanRole.OFFICER].includes(performer.role)) {
      throw new ForbiddenException('Insufficient permissions');
    }

    const member = clan.members.get(playerId);
    if (!member) {
      throw new NotFoundException(`Member ${playerId} not found in clan`);
    }

    member.role = newRole;
    this.logger.log(`Member ${playerId} role updated to ${newRole} in clan ${clanId}`);
  }

  /**
   * Start clan war
   */
  initiateClanWar(clan1Id: string, clan2Id: string, prize: number): ClanWar {
    const clan1 = this.clans.get(clan1Id);
    const clan2 = this.clans.get(clan2Id);

    if (!clan1 || !clan2) {
      throw new NotFoundException('One or both clans not found');
    }

    const warId = uuidv4();
    const war: ClanWar = {
      id: warId,
      clan1Id,
      clan2Id,
      startTime: Date.now(),
      clan1Score: 0,
      clan2Score: 0,
      status: 'scheduled',
      prize,
    };

    this.clanWars.set(warId, war);
    this.logger.log(`Clan war initiated: ${clan1Id} vs ${clan2Id}`);
    return war;
  }

  /**
   * Record clan war result
   */
  endClanWar(warId: string, winnerClanId: string): ClanWar {
    const war = this.clanWars.get(warId);
    if (!war) {
      throw new NotFoundException(`War ${warId} not found`);
    }

    const winnerClan = this.clans.get(winnerClanId);
    if (!winnerClan) {
      throw new NotFoundException(`Clan ${winnerClanId} not found`);
    }

    war.status = 'completed';
    war.endTime = Date.now();

    // Award prize to winner
    winnerClan.treasury += war.prize;
    winnerClan.experience += 100 * winnerClan.members.size; // XP per member

    // Check level up
    this.checkClanLevelUp(winnerClanId);

    this.logger.log(`Clan war completed: ${winnerClanId} won`);
    return war;
  }

  /**
   * Research clan technology
   */
  researchTech(clanId: string, techId: string): ClanTech {
    const clan = this.clans.get(clanId);
    if (!clan) {
      throw new NotFoundException(`Clan ${clanId} not found`);
    }

    const techs = this.clanTechs.get(clanId) || [];
    const existingTech = techs.find((t) => t.id === techId);

    if (existingTech && existingTech.level >= existingTech.maxLevel) {
      throw new BadRequestException('Tech already at max level');
    }

    // Find tech definition
    const baseTech = this.getTechDefinition(techId);
    if (!baseTech) {
      throw new NotFoundException('Tech not found');
    }

    const cost = baseTech.cost * (existingTech?.level || 1);
    if (clan.treasury < cost) {
      throw new BadRequestException('Insufficient clan funds');
    }

    // Deduct cost and upgrade
    clan.treasury -= cost;

    if (existingTech) {
      existingTech.level++;
    } else {
      const newTech = { ...baseTech, level: 1 };
      techs.push(newTech);
      this.clanTechs.set(clanId, techs);
    }

    return existingTech || techs[techs.length - 1];
  }

  /**
   * Get clan details
   */
  getClan(clanId: string): Clan | null {
    return this.clans.get(clanId) || null;
  }

  /**
   * Get player's clan
   */
  getPlayerClan(playerId: string): Clan | null {
    const clanId = this.playerClans.get(playerId);
    return clanId ? this.clans.get(clanId) || null : null;
  }

  /**
   * Get clan leaderboard
   */
  getClanLeaderboard(limit: number = 100): Array<{
    rank: number;
    clanId: string;
    name: string;
    tag: string;
    level: number;
    members: number;
    wins: number;
  }> {
    const standings = Array.from(this.clans.values()).map((clan) => ({
      clanId: clan.id,
      name: clan.name,
      tag: clan.tag,
      level: clan.level,
      members: clan.members.size,
      wins: Array.from(this.clanWars.values()).filter(
        (w) => (w.clan1Id === clan.id && w.clan1Score > w.clan2Score) || (w.clan2Id === clan.id && w.clan2Score > w.clan1Score),
      ).length,
    }));

    standings.sort((a, b) => {
      if (b.level !== a.level) return b.level - a.level;
      return b.wins - a.wins;
    });

    return standings.map((s, i) => ({ rank: i + 1, ...s })).slice(0, limit);
  }

  // ============ PRIVATE METHODS ============

  private checkClanLevelUp(clanId: string): void {
    const clan = this.clans.get(clanId);
    if (!clan) return;

    const xpPerLevel = 1000;
    const newLevel = Math.floor(clan.experience / xpPerLevel) + 1;

    if (newLevel > clan.level) {
      clan.level = newLevel;
      clan.maxMembers += 10; // Increase max members
      this.logger.log(`Clan ${clanId} leveled up to ${newLevel}`);
    }
  }

  private getTechDefinition(techId: string): ClanTech | null {
    const techs: ClanTech[] = [
      {
        id: 'damage-boost',
        name: 'Weapon Enhancement',
        description: 'Increase all clan members damage by 5% per level',
        cost: 500,
        level: 0,
        maxLevel: 5,
        bonus: { damage: 0.05 },
      },
      {
        id: 'armor-upgrade',
        name: 'Armor Upgrade',
        description: 'Reduce incoming damage by 3% per level',
        cost: 500,
        level: 0,
        maxLevel: 5,
        bonus: { armor: 0.03 },
      },
      {
        id: 'xp-boost',
        name: 'Experience Boost',
        description: 'Earn 10% more experience per level',
        cost: 400,
        level: 0,
        maxLevel: 3,
        bonus: { xp: 0.1 },
      },
      {
        id: 'war-treasury',
        name: 'War Treasury',
        description: 'Increase war prize rewards by 5% per level',
        cost: 600,
        level: 0,
        maxLevel: 5,
        bonus: { prizeBonus: 0.05 },
      },
    ];

    return techs.find((t) => t.id === techId) || null;
  }

  private initializeTechTree(): void {
    // Pre-initialize tech tree on startup
    this.logger.log('Tech tree initialized');
  }
}

// Singleton instance
export const clanService = new ClanService();
