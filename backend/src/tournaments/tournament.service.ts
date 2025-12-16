import { Injectable, Logger, BadRequestException, NotFoundException } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';

export enum TournamentFormat {
  SINGLE_ELIMINATION = 'single_elimination',
  DOUBLE_ELIMINATION = 'double_elimination',
  ROUND_ROBIN = 'round_robin',
  SWISS = 'swiss',
}

export enum TournamentStatus {
  DRAFT = 'draft',
  REGISTRATION = 'registration',
  RUNNING = 'running',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export enum MatchStatus {
  PENDING = 'pending',
  SCHEDULED = 'scheduled',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export interface Participant {
  id: string;
  name: string;
  eloRating: number;
  joinedAt: number;
  isReady: boolean;
}

export interface BracketMatch {
  id: string;
  tournamentId: string;
  round: number;
  matchNumber: number;
  player1Id?: string;
  player2Id?: string;
  winnerId?: string;
  score?: { player1: number; player2: number };
  scheduledFor?: number;
  startedAt?: number;
  completedAt?: number;
  status: MatchStatus;
}

export interface TournamentBracket {
  id: string;
  name: string;
  format: TournamentFormat;
  status: TournamentStatus;
  participants: Participant[];
  matches: BracketMatch[];
  rounds: number;
  currentRound: number;
  startDate: number;
  endDate?: number;
  maxParticipants: number;
  prizePool: number;
  prizes: PrizeDistribution;
  createdAt: number;
  updatedAt: number;
}

export interface PrizeDistribution {
  first: number; // %
  second: number; // %
  third: number; // %
  participation: number; // %
}

@Injectable()
export class TournamentService {
  private readonly logger = new Logger(TournamentService.name);
  private tournaments: Map<string, TournamentBracket> = new Map();
  private matches: Map<string, BracketMatch> = new Map();

  /**
   * Create new tournament
   */
  createTournament(
    name: string,
    format: TournamentFormat,
    maxParticipants: number,
    prizePool: number = 1000,
  ): TournamentBracket {
    const tournamentId = uuidv4();
    const rounds = Math.ceil(Math.log2(maxParticipants));

    const tournament: TournamentBracket = {
      id: tournamentId,
      name,
      format,
      status: TournamentStatus.REGISTRATION,
      participants: [],
      matches: [],
      rounds,
      currentRound: 0,
      startDate: Date.now(),
      maxParticipants,
      prizePool,
      prizes: this.calculatePrizeDistribution(),
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    this.tournaments.set(tournamentId, tournament);
    this.logger.log(`Tournament created: ${name} (${tournamentId})`);
    return tournament;
  }

  /**
   * Register player in tournament
   */
  registerPlayer(
    tournamentId: string,
    playerId: string,
    playerName: string,
    eloRating: number,
  ): Participant {
    const tournament = this.tournaments.get(tournamentId);
    if (!tournament) {
      throw new NotFoundException(`Tournament ${tournamentId} not found`);
    }

    if (tournament.status !== TournamentStatus.REGISTRATION) {
      throw new BadRequestException('Tournament registration is closed');
    }

    if (tournament.participants.length >= tournament.maxParticipants) {
      throw new BadRequestException('Tournament is full');
    }

    // Check if player already registered
    if (tournament.participants.some((p) => p.id === playerId)) {
      throw new BadRequestException('Player already registered');
    }

    const participant: Participant = {
      id: playerId,
      name: playerName,
      eloRating,
      joinedAt: Date.now(),
      isReady: false,
    };

    tournament.participants.push(participant);
    tournament.updatedAt = Date.now();

    this.logger.log(`Player ${playerName} registered for tournament ${tournamentId}`);
    return participant;
  }

  /**
   * Start tournament and generate brackets
   */
  startTournament(tournamentId: string): TournamentBracket {
    const tournament = this.tournaments.get(tournamentId);
    if (!tournament) {
      throw new NotFoundException(`Tournament ${tournamentId} not found`);
    }

    if (tournament.status !== TournamentStatus.REGISTRATION) {
      throw new BadRequestException('Tournament cannot be started');
    }

    if (tournament.participants.length < 2) {
      throw new BadRequestException('At least 2 participants required');
    }

    // Sort participants by ELO for seeding
    tournament.participants.sort((a, b) => b.eloRating - a.eloRating);

    // Generate bracket based on format
    switch (tournament.format) {
      case TournamentFormat.SINGLE_ELIMINATION:
        this.generateSingleElimination(tournament);
        break;
      case TournamentFormat.DOUBLE_ELIMINATION:
        this.generateDoubleElimination(tournament);
        break;
      case TournamentFormat.ROUND_ROBIN:
        this.generateRoundRobin(tournament);
        break;
      case TournamentFormat.SWISS:
        this.generateSwiss(tournament);
        break;
    }

    tournament.status = TournamentStatus.RUNNING;
    tournament.currentRound = 1;
    tournament.updatedAt = Date.now();

    this.logger.log(`Tournament ${tournamentId} started`);
    return tournament;
  }

  /**
   * Record match result
   */
  recordMatchResult(
    matchId: string,
    winnerId: string,
    score: { player1: number; player2: number },
  ): BracketMatch {
    const match = this.matches.get(matchId);
    if (!match) {
      throw new NotFoundException(`Match ${matchId} not found`);
    }

    if (match.status !== MatchStatus.IN_PROGRESS) {
      throw new BadRequestException('Match is not in progress');
    }

    // Verify winner is one of the players
    if (winnerId !== match.player1Id && winnerId !== match.player2Id) {
      throw new BadRequestException('Invalid winner');
    }

    match.winnerId = winnerId;
    match.score = score;
    match.completedAt = Date.now();
    match.status = MatchStatus.COMPLETED;

    this.logger.log(`Match ${matchId} completed. Winner: ${winnerId}`);
    return match;
  }

  /**
   * Get next round matches
   */
  getNextRoundMatches(
    tournamentId: string,
  ): {
    nextMatches: BracketMatch[];
    canAdvance: boolean;
    reason?: string;
  } {
    const tournament = this.tournaments.get(tournamentId);
    if (!tournament) {
      throw new NotFoundException(`Tournament ${tournamentId} not found`);
    }

    const currentRoundMatches = tournament.matches.filter(
      (m) => m.round === tournament.currentRound,
    );
    const completedMatches = currentRoundMatches.filter((m) => m.status === MatchStatus.COMPLETED);

    const canAdvance = completedMatches.length === currentRoundMatches.length;

    if (canAdvance) {
      tournament.currentRound++;
      const nextMatches = tournament.matches.filter((m) => m.round === tournament.currentRound);
      return { nextMatches, canAdvance: true };
    }

    return {
      nextMatches: [],
      canAdvance: false,
      reason: `${currentRoundMatches.length - completedMatches.length} match(es) not completed`,
    };
  }

  /**
   * Get tournament standings
   */
  getStandings(
    tournamentId: string,
  ): Array<{
    rank: number;
    participantId: string;
    participantName: string;
    wins: number;
    losses: number;
    winRate: number;
  }> {
    const tournament = this.tournaments.get(tournamentId);
    if (!tournament) {
      throw new NotFoundException(`Tournament ${tournamentId} not found`);
    }

    const standings = tournament.participants.map((participant) => {
      const wins = tournament.matches.filter(
        (m) => m.winnerId === participant.id && m.status === MatchStatus.COMPLETED,
      ).length;
      const losses = tournament.matches.filter(
        (m) =>
          (m.player1Id === participant.id || m.player2Id === participant.id) &&
          m.winnerId !== participant.id &&
          m.status === MatchStatus.COMPLETED,
      ).length;
      const total = wins + losses;

      return {
        participantId: participant.id,
        participantName: participant.name,
        wins,
        losses,
        winRate: total > 0 ? (wins / total) * 100 : 0,
      };
    });

    // Sort by wins and win rate
    standings.sort((a, b) => {
      if (b.wins !== a.wins) return b.wins - a.wins;
      return b.winRate - a.winRate;
    });

    // Add ranks
    return standings.map((s, index) => ({ rank: index + 1, ...s }));
  }

  /**
   * Complete tournament
   */
  completeTournament(tournamentId: string): TournamentBracket {
    const tournament = this.tournaments.get(tournamentId);
    if (!tournament) {
      throw new NotFoundException(`Tournament ${tournamentId} not found`);
    }

    tournament.status = TournamentStatus.COMPLETED;
    tournament.endDate = Date.now();
    tournament.updatedAt = Date.now();

    const standings = this.getStandings(tournamentId);
    this.logger.log(`Tournament ${tournamentId} completed. Winner: ${standings[0]?.participantName}`);

    return tournament;
  }

  /**
   * Get tournament details
   */
  getTournament(tournamentId: string): TournamentBracket | null {
    return this.tournaments.get(tournamentId) || null;
  }

  /**
   * List all tournaments
   */
  listTournaments(status?: TournamentStatus): TournamentBracket[] {
    const all = Array.from(this.tournaments.values());
    return status ? all.filter((t) => t.status === status) : all;
  }

  // ============ PRIVATE METHODS ============

  private generateSingleElimination(tournament: TournamentBracket): void {
    let round = 1;
    let matchNumber = 1;
    let participants = [...tournament.participants];

    while (participants.length > 1) {
      const roundMatches: BracketMatch[] = [];

      for (let i = 0; i < participants.length; i += 2) {
        const matchId = uuidv4();
        const match: BracketMatch = {
          id: matchId,
          tournamentId: tournament.id,
          round,
          matchNumber,
          player1Id: participants[i]?.id,
          player2Id: participants[i + 1]?.id,
          status: MatchStatus.PENDING,
        };

        roundMatches.push(match);
        this.matches.set(matchId, match);
        matchNumber++;
      }

      tournament.matches.push(...roundMatches);

      // Prepare next round (winners only)
      participants = Array(Math.ceil(participants.length / 2));
      round++;
    }
  }

  private generateDoubleElimination(tournament: TournamentBracket): void {
    // Similar to single elimination but with losers bracket
    // For simplicity, we'll implement single elimination
    this.generateSingleElimination(tournament);
  }

  private generateRoundRobin(tournament: TournamentBracket): void {
    let round = 1;
    let matchNumber = 1;
    const participants = tournament.participants;

    // Each participant plays every other participant
    for (let i = 0; i < participants.length; i++) {
      for (let j = i + 1; j < participants.length; j++) {
        const matchId = uuidv4();
        const match: BracketMatch = {
          id: matchId,
          tournamentId: tournament.id,
          round,
          matchNumber,
          player1Id: participants[i].id,
          player2Id: participants[j].id,
          status: MatchStatus.PENDING,
        };

        tournament.matches.push(match);
        this.matches.set(matchId, match);
        matchNumber++;
      }
      round++;
    }
  }

  private generateSwiss(tournament: TournamentBracket): void {
    // Swiss system: simple implementation (round 1 seeded pairing)
    const participants = tournament.participants;
    const matchId = uuidv4();
    const match: BracketMatch = {
      id: matchId,
      tournamentId: tournament.id,
      round: 1,
      matchNumber: 1,
      player1Id: participants[0]?.id,
      player2Id: participants[1]?.id,
      status: MatchStatus.PENDING,
    };

    tournament.matches.push(match);
    this.matches.set(matchId, match);
  }

  private calculatePrizeDistribution(): PrizeDistribution {
    return {
      first: 50,
      second: 30,
      third: 15,
      participation: 5,
    };
  }
}
