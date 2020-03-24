import http from 'http';
import express from 'express';
import { ILoader } from './loaders/loader';

interface IServer {
  start(): void;
}

export class Server implements IServer {
  constructor(
    private app: express.Application,
    private server: http.Server,
    private rootLoader: ILoader,
  ) {}

  start() {
    this.rootLoader.run(this.app, this.server);

    this.server.listen(4000, () => {
      console.log('Listening on 4000');
    });
  }
}
