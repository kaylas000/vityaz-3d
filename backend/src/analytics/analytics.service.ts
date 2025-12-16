import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter } from 'eventemitter3';

export enum EventType {
  // Player events
  PLAYER_JOINED = 'player_joined',
  PLAYER_LEFT = 'player_left',
  PLAYER_LEVEL_UP = 'player_level_up',
  PLAYER_ACHIEVEMENT = 'player_achievement',

  // Game events
  GAME_STARTED = 'game_started',
  GAME_ENDED = 'game_ended',
  ROUND_STARTED = 'round_started',
  ROUND_ENDED = 'round_ended',

  // Combat events
  PLAYER_KILLED = 'player_killed',
  PLAYER_DIED = 'player_died',
  HEADSHOT = 'headshot',
  KILL_STREAK = 'kill_streak',
  DOUBLE_KILL = 'double_kill',

  // Match events
  MATCH_STARTED = 'match_started',
  MATCH_COMPLETED = 'match_completed',
  MATCH_ABANDONED = 'match_abandoned',

  // Economy events
  MONEY_EARNED = 'money_earned',
  ITEM_PURCHASED = 'item_purchased',
  ACHIEVEMENT_UNLOCKED = 'achievement_unlocked',

  // Social events
  CLAN_CREATED = 'clan_created',
  CLAN_JOINED = 'clan_joined',
  TOURNAMENT_JOINED = 'tournament_joined',
  TOURNAMENT_WON = 'tournament_won',
}

export interface GameEvent {
  id: string;
  type: EventType;
  playerId: string;
  timestamp: number;
  data: Record<string, any>;
  sessionId?: string;
}

export interface PlayerStats {
  playerId: string;
  totalMatches: number;
  totalWins: number;
  totalLosses: number;
  totalKills: number;
  totalDeaths: number;
  totalHeadshots: number;
  accuracy: number; // percentage
  averageKDA: number; // (kills + assists) / deaths
  longestKillStreak: number;
  totalPlayTime: number; // seconds
  averageMatchDuration: number; // seconds
  preferredWeapon: string;
  preferredMap: string;
  lastPlayedAt: number;
}

export interface SessionAnalytics {
  sessionId: string;
  playerId: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  events: GameEvent[];
  statsSnapshot: Partial<PlayerStats>;
}

@Injectable()
export class AnalyticsService extends EventEmitter {
  private readonly logger = new Logger(AnalyticsService.name);
  private events: Map<string, GameEvent[]> = new Map();
  private playerStats: Map<string, PlayerStats> = new Map();
  private sessions: Map<string, SessionAnalytics> = new Map();
  private readonly MAX_EVENTS_PER_PLAYER = 10000; // Keep last 10k events

  constructor() {
    super();
  }

  /**
   * Track game event
   */
  trackEvent(type: EventType, playerId: string, data: Record<string, any>, sessionId?: string): GameEvent {
    const event: GameEvent = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type,
      playerId,
      timestamp: Date.now(),
      data,
      sessionId,
    };

    // Store event
    if (!this.events.has(playerId)) {
      this.events.set(playerId, []);
    }

    const playerEvents = this.events.get(playerId)!;
    playerEvents.push(event);

    // Keep only recent events
    if (playerEvents.length > this.MAX_EVENTS_PER_PLAYER) {
      playerEvents.shift();
    }

    // Emit event for real-time analytics
    this.emit(type, event);

    // Update player stats based on event
    this.updatePlayerStats(playerId, type, data);

    return event;
  }

  /**
   * Start game session
   */
  startSession(playerId: string): SessionAnalytics {
    const sessionId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const session: SessionAnalytics = {
      sessionId,
      playerId,
      startTime: Date.now(),
      events: [],
      statsSnapshot: {},
    };

    this.sessions.set(sessionId, session);
    this.logger.log(`Session started: ${sessionId} for player ${playerId}`);

    return session;
  }

  /**
   * End game session
   */
  endSession(sessionId: string): SessionAnalytics | null {
    const session = this.sessions.get(sessionId);
    if (!session) {
      return null;
    }

    session.endTime = Date.now();
    session.duration = session.endTime - session.startTime;

    this.logger.log(`Session ended: ${sessionId} (${session.duration}ms)`);
    return session;
  }

  /**
   * Get player statistics
   */
  getPlayerStats(playerId: string): PlayerStats | null {
    return this.playerStats.get(playerId) || null;
  }

  /**
   * Get player events
   */
  getPlayerEvents(playerId: string, type?: EventType, limit: number = 100): GameEvent[] {
    const events = this.events.get(playerId) || [];
    let filtered = [...events];

    if (type) {
      filtered = filtered.filter((e) => e.type === type);
    }

    return filtered.slice(-limit);
  }

  /**
   * Get top players by stat
   */
  getTopPlayers(statKey: keyof PlayerStats, limit: number = 100): PlayerStats[] {
    return Array.from(this.playerStats.values())
      .sort((a, b) => {
        const aVal = a[statKey] || 0;
        const bVal = b[statKey] || 0;
        if (typeof aVal === 'number' && typeof bVal === 'number') {
          return bVal - aVal;
        }
        return 0;
      })
      .slice(0, limit);
  }

  /**
   * Generate player report
   */
  generatePlayerReport(playerId: string): {
    stats: PlayerStats | null;
    recentEvents: GameEvent[];
    achievements: string[];
    streaks: { type: string; current: number; best: number }[];
  } {
    const stats = this.playerStats.get(playerId);
    const recentEvents = this.getPlayerEvents(playerId, undefined, 50);
    const achievements = this.extractAchievements(playerId);
    const streaks = this.calculateStreaks(playerId);

    return {
      stats: stats || null,
      recentEvents,
      achievements,
      streaks,
    };
  }

  /**
   * Get aggregate statistics
   */
  getAggregateStats(): {
    totalPlayers: number;
    totalMatches: number;
    totalKills: number;
    totalDeaths: number;
    averageKDA: number;
    uniqueEvents: number;
  } {
    const players = Array.from(this.playerStats.values());
    const totalMatches = players.reduce((sum, p) => sum + p.totalMatches, 0);
    const totalKills = players.reduce((sum, p) => sum + p.totalKills, 0);
    const totalDeaths = players.reduce((sum, p) => sum + p.totalDeaths, 0);
    const averageKDA = totalDeaths > 0 ? totalKills / totalDeaths : 0;

    return {
      totalPlayers: players.length,
      totalMatches,
      totalKills,
      totalDeaths,
      averageKDA,
      uniqueEvents: this.events.size,
    };
  }

  /**
   * Export analytics data (for external storage/processing)
   */
  exportAnalytics(playerId?: string, format: 'json' | 'csv' = 'json'): string {
    if (playerId) {
      const events = this.events.get(playerId) || [];
      const stats = this.playerStats.get(playerId);

      if (format === 'json') {
        return JSON.stringify({ playerId, stats, events }, null, 2);
      } else if (format === 'csv') {
        return this.eventsToCSV(events);
      }
    }

    // Export all data
    if (format === 'json') {
      return JSON.stringify(
        {
          timestamp: Date.now(),
          stats: Array.from(this.playerStats.values()),
          eventCount: Array.from(this.events.values()).reduce((sum, arr) => sum + arr.length, 0),
        },
        null,
        2,
      );
    }

    return '';
  }

  // ============ PRIVATE METHODS ============

  private updatePlayerStats(playerId: string, eventType: EventType, data: Record<string, any>): void {
    if (!this.playerStats.has(playerId)) {
      this.playerStats.set(playerId, {
        playerId,
        totalMatches: 0,
        totalWins: 0,
        totalLosses: 0,
        totalKills: 0,
        totalDeaths: 0,
        totalHeadshots: 0,
        accuracy: 0,
        averageKDA: 0,
        longestKillStreak: 0,
        totalPlayTime: 0,
        averageMatchDuration: 0,
        preferredWeapon: '',
        preferredMap: '',
        lastPlayedAt: Date.now(),
      });
    }

    const stats = this.playerStats.get(playerId)!;

    switch (eventType) {
      case EventType.PLAYER_KILLED:
        stats.totalKills++;
        if (data.headshot) stats.totalHeadshots++;
        stats.lastPlayedAt = Date.now();
        break;

      case EventType.PLAYER_DIED:
        stats.totalDeaths++;
        stats.lastPlayedAt = Date.now();
        break;

      case EventType.MATCH_COMPLETED:
        stats.totalMatches++;
        if (data.won) stats.totalWins++;
        else stats.totalLosses++;
        break;

      case EventType.KILL_STREAK:
        if (data.streakCount > stats.longestKillStreak) {
          stats.longestKillStreak = data.streakCount;
        }
        break;
    }

    // Calculate derived stats
    if (stats.totalDeaths > 0) {
      stats.averageKDA = (stats.totalKills + (data.assists || 0)) / stats.totalDeaths;
    } else {
      stats.averageKDA = stats.totalKills;
    }
  }

  private extractAchievements(playerId: string): string[] {
    const events = this.getPlayerEvents(playerId, EventType.ACHIEVEMENT_UNLOCKED);
    return events.map((e) => e.data.achievementId);
  }

  private calculateStreaks(
    playerId: string,
  ): Array<{ type: string; current: number; best: number }> {
    const stats = this.playerStats.get(playerId);
    if (!stats) return [];

    return [
      {
        type: 'Kill Streak',
        current: 0, // Would need to calculate from recent events
        best: stats.longestKillStreak,
      },
      {
        type: 'Win Streak',
        current: 0,
        best: 0,
      },
    ];
  }

  private eventsToCSV(events: GameEvent[]): string {
    if (events.length === 0) return '';

    const headers = ['ID', 'Type', 'PlayerID', 'Timestamp', 'Data'];
    const rows = events.map((e) => [
      e.id,
      e.type,
      e.playerId,
      new Date(e.timestamp).toISOString(),
      JSON.stringify(e.data),
    ]);

    return [
      headers.join(','),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
    ].join('\n');
  }
}

// Singleton instance
export const analyticsService = new AnalyticsService();
