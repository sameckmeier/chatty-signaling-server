import crypto from 'crypto';
import http from 'http';
import express from 'express';
import WebSocket from 'ws';
import { ILoader } from './loader';

enum WEB_SOCKET_CHANNELS {
  CONNECTION = 'connection',
  MESSAGE = 'message',
}

enum WEB_SOCKET_EVENTS {
  PEER = 'peer',
  SIGNAL = 'signal',
  CONNECTED = 'connected',
}

interface ConnetionIdDict {
  [key: string]: WebSocket;
}

let wss;
const connectionIds: ConnetionIdDict = {};

export class SocketLoader implements ILoader {
  public run(app: express.Application, server: http.Server): void {
    wss = new WebSocket.Server({ server });

    wss.on(WEB_SOCKET_CHANNELS.CONNECTION, socket => {
      const id = this.genId();
      connectionIds[id] = socket;

      this.registerSignalHandler(id);

      this.sendPeerId(id, connectionIds);
      this.callPeers(id, connectionIds);
    });
  }

  private callPeers(id: string, otherSockets: ConnetionIdDict) {
    const socket = connectionIds[id];

    Object.keys(otherSockets).forEach((otherId: string) => {
      const otherSocket = connectionIds[otherId];

      if (this.isAvailable(socket, otherSocket)) {
        socket.send(
          JSON.stringify({
            type: WEB_SOCKET_EVENTS.PEER,
            peerId: otherId,
            initiator: false,
          }),
        );

        otherSocket.send(
          JSON.stringify({
            type: WEB_SOCKET_EVENTS.PEER,
            peerId: id,
            initiator: true,
          }),
        );
      }
    });
  }

  private sendPeerId(id: string, connectionIds: ConnetionIdDict) {
    const socket = connectionIds[id];

    socket.send(
      JSON.stringify({
        type: WEB_SOCKET_EVENTS.CONNECTED,
        peerId: id,
      }),
    );
  }

  private registerSignalHandler(id: string) {
    const socket = connectionIds[id];

    socket.on(WEB_SOCKET_CHANNELS.MESSAGE, (json: string) => {
      const data = JSON.parse(json);

      if (data.type === WEB_SOCKET_EVENTS.SIGNAL) {
        const otherSocket = connectionIds[data.peerId];

        if (!otherSocket) {
          return;
        }

        otherSocket.send(
          JSON.stringify({
            type: WEB_SOCKET_EVENTS.SIGNAL,
            peerId: id,
            signal: data.signal,
          }),
        );
      }
    });
  }

  private isAvailable(a: WebSocket, b: WebSocket) {
    return a !== b && b.readyState === WebSocket.OPEN;
  }

  private genId() {
    return crypto.randomBytes(16).toString('hex');
  }
}
