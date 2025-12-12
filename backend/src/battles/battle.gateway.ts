import { WebSocketGateway, WebSocketServer, SubscribeMessage, OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets'
import { Server, Socket } from 'socket.io'
import { CombatEngineService } from './combat.engine'
import { TokenService } from '../economy/token.service'
import { PrismaService } from '../database/prisma.service'

interface PlayerData {
  id: string
  username: string
  x: number
  y: number
  angle: number
  health: number
  ammo: number
  isAlive: boolean
}

interface BattleRoom {
  id: string
  players: Map<string, PlayerData>
  startTime: number
}

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class BattleGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server

  private battleRooms: Map<string, BattleRoom> = new Map()
  private playerRooms: Map<string, string> = new Map() // playerId -> roomId
  private playerStats: Map<string, { kills: number; deaths: number; score: number }> = new Map()

  constructor(
    private combatEngine: CombatEngineService,
    private tokenService: TokenService,
    private prisma: PrismaService,
  ) {}

  afterInit(server: Server) {
    console.log('🎮 Battle Gateway initialized')
  }

  handleConnection(client: Socket) {
    console.log(`✅ Player connected: ${client.id}`)
  }

  handleDisconnect(client: Socket) {
    console.log(`❌ Player disconnected: ${client.id}`)
    const roomId = this.playerRooms.get(client.id)
    if (roomId) {
      this.playerRooms.delete(client.id)
    }
  }

  /**
   * Player joins battle
   */
  @SubscribeMessage('battle:join')
  handleJoin(client: Socket, data: { playerId: string; difficulty: string }) {
    const { playerId, difficulty } = data
    const roomId = `battle_${Date.now()}`

    // Create battle room if doesn't exist
    if (!this.battleRooms.has(roomId)) {
      this.battleRooms.set(roomId, {
        id: roomId,
        players: new Map(),
        startTime: Date.now(),
      })
    }

    const room = this.battleRooms.get(roomId)!
    const playerData: PlayerData = {
      id: playerId,
      username: `Player_${playerId.slice(0, 8)}`,
      x: Math.random() * 800 + 100,
      y: Math.random() * 600 + 100,
      angle: 0,
      health: 100,
      ammo: 30,
      isAlive: true,
    }

    room.players.set(playerId, playerData)
    this.playerRooms.set(client.id, roomId)
    this.playerStats.set(playerId, { kills: 0, deaths: 0, score: 0 })

    // Join socket room
    client.join(roomId)

    // Notify all players
    this.server.to(roomId).emit('battle:player_joined', playerData)
    client.emit('battle:start', { roomId, players: Array.from(room.players.values()) })
  }

  /**
   * Player updates position/state
   */
  @SubscribeMessage('battle:update')
  handleUpdate(client: Socket, data: PlayerData) {
    const roomId = this.playerRooms.get(client.id)
    if (!roomId) return

    const room = this.battleRooms.get(roomId)
    if (!room) return

    const player = room.players.get(data.id)
    if (player) {
      player.x = data.x
      player.y = data.y
      player.angle = data.angle
      player.health = data.health
      player.ammo = data.ammo
    }

    // Broadcast to other players
    client.to(roomId).emit('battle:player_update', data)
  }

  /**
   * Player fires weapon
   */
  @SubscribeMessage('battle:shot')
  handleShot(
    client: Socket,
    data: {
      playerId: string
      position: { x: number; y: number }
      trajectory: { startX: number; startY: number; endX: number; endY: number }
    },
  ) {
    const roomId = this.playerRooms.get(client.id)
    if (!roomId) return

    // Validate shot (anti-cheat)
    const validation = this.combatEngine.validateShot(
      data.playerId,
      data.position,
      {
        startX: data.trajectory.startX,
        startY: data.trajectory.startY,
        endX: data.trajectory.endX,
        endY: data.trajectory.endY,
        timestamp: Date.now(),
      },
    )

    if (!validation.valid) {
      console.warn(`⚠️ Invalid shot from ${data.playerId}: ${validation.reason}`)
      this.server.to(roomId).emit('battle:shot', data) // Still show for UX
      return
    }

    // Broadcast shot to all players
    this.server.to(roomId).emit('battle:shot', data)
  }

  /**
   * Player hit
   */
  @SubscribeMessage('battle:hit')
  async handleHit(
    client: Socket,
    data: { playerId: string; targetId: string; weapon: string; damage: number },
  ) {
    const roomId = this.playerRooms.get(client.id)
    if (!roomId) return

    const room = this.battleRooms.get(roomId)
    if (!room) return

    // Update target health
    const target = room.players.get(data.targetId)
    if (target) {
      target.health -= data.damage

      if (target.health <= 0) {
        target.isAlive = false

        // Update kill stats
        const attacker = this.playerStats.get(data.playerId)
        if (attacker) {
          attacker.kills++
          attacker.score += data.damage * 10
        }

        const victim = this.playerStats.get(data.targetId)
        if (victim) {
          victim.deaths++
        }
      }
    }

    // Broadcast hit
    this.server.to(roomId).emit('battle:hit', data)
  }

  /**
   * End battle
   */
  @SubscribeMessage('battle:end')
  async handleEnd(client: Socket, data: { playerId: string; score: number; kills: number }) {
    const roomId = this.playerRooms.get(client.id)
    if (!roomId) return

    const stats = this.playerStats.get(data.playerId)
    if (!stats) return

    // Award tokens based on performance
    const reward = Math.floor(stats.kills * 50 + stats.score / 10)

    try {
      await this.tokenService.rewardPlayer(
        data.playerId,
        reward,
        `Battle victory: ${data.kills} kills, ${data.score} score`,
      )

      client.emit('battle:reward', { tokensEarned: reward })
    } catch (e) {
      console.error('Error rewarding player:', e)
    }

    // Clean up
    this.playerStats.delete(data.playerId)
    this.playerRooms.delete(client.id)
  }
}
