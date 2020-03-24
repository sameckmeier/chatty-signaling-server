import http from 'http';
import express from 'express';
import { Server } from './infra/server';
import { rootLoader } from './infra/loaders';

const app = express();
const httpServer = http.createServer(app);

const server = new Server(app, httpServer, rootLoader);

server.start();
