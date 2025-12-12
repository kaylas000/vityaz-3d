import { WebSocketGateway, WebSocketServer, SubscribeMessage } from '@nestjs/websockets'
import { Server, Socket } from 'socket.io'

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class BattlesGateway {
  @WebSocketServer()
  server: Server

  @SubscribeMessage('battle:join')
  handleBattleJoin(client: Socket, data: any) {
    this.server.emit('battle:update', data)
  }

  @SubscribeMessage('battle:action')
  handleBattleAction(client: Socket, data: any) {
    this.server.emit('battle:action', data)
  }
}
