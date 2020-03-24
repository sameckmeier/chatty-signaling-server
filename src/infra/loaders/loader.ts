import http from 'http';
import express from 'express';

export interface ILoader {
  run(app: express.Application, server: http.Server): void;
}
