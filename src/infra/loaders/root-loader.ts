import http from 'http';
import express from 'express';
import { ILoader } from './loader';

export class RootLoader implements ILoader {
  constructor(private loaders: ILoader[]) {}

  public run(
    app: express.Application,
    server: http.Server,
  ): express.Application {
    this.loaders.forEach((loader: ILoader) => loader.run(app, server));
    return app;
  }
}
