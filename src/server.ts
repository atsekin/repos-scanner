import path from 'path';
import express, { Request, Response, NextFunction } from 'express';
import logger from 'jet-logger';
import { expressMiddleware } from '@apollo/server/express4';
import { ApolloServer } from '@apollo/server';
import bodyParser from 'body-parser';
import cors from 'cors';
import 'express-async-errors';

import Env from '@src/common/Env';
import HttpStatusCodes from '@src/common/HttpStatusCodes';
import { RouteError } from '@src/common/route-errors';
import { NodeEnvs } from '@src/common/constants';

import { typeDefs } from '@src/graphql/typeDefs';
import { resolvers } from '@src/graphql/resolvers';

const app = express();

app.use(express.json());
app.use(express.urlencoded({extended: true}));

// Add error handler
app.use((err: Error, _: Request, res: Response, next: NextFunction) => {
  if (Env.NodeEnv !== NodeEnvs.Test.valueOf()) {
    logger.err(err, true);
  }
  let status = HttpStatusCodes.BAD_REQUEST;
  if (err instanceof RouteError) {
    status = err.status;
    res.status(status).json({ error: err.message });
  }
  return next(err);
});

const viewsDir = path.join(__dirname, 'views');
app.set('views', viewsDir);

const staticDir = path.join(__dirname, 'public');
app.use(express.static(staticDir));

app.get('/', (_: Request, res: Response) => {
  return res.sendFile('index.html', { root: viewsDir });
});

const server = new ApolloServer({ typeDefs, resolvers });

(async () => {
  await server.start();
  app.use('/graphql', cors(), bodyParser.json(), expressMiddleware(server));
})();

export default app;
