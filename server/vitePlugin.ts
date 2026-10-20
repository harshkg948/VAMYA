import { Plugin } from 'vite';
import { apiRouter } from './apiRouter';
import express from 'express';

export function agentApiPlugin(): Plugin {
  return {
    name: 'agent-api-plugin',
    configureServer(server) {
      const app = express();
      app.use('/api', apiRouter);
      server.middlewares.use(app);
    },
  };
}
