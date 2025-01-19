import morgan from 'morgan';
import path from 'path';
import helmet from 'helmet';
import express, { Request, Response, NextFunction } from 'express';
import logger from 'jet-logger';
import { expressMiddleware } from '@apollo/server/express4';
import { ApolloServer } from '@apollo/server';
import bodyParser from 'body-parser';
import cors from 'cors';

import 'express-async-errors';

import BaseRouter from '@src/routes';

import Paths from '@src/routes/common/Paths';
import Env from '@src/common/Env';
import HttpStatusCodes from '@src/common/HttpStatusCodes';
import { RouteError } from '@src/common/route-errors';
import { NodeEnvs } from '@src/common/constants';
import githubApiClient from '@src/githubApiClient';


/******************************************************************************
                                Variables
******************************************************************************/

const app = express();


// **** Setup

// Basic middleware
app.use(express.json());
app.use(express.urlencoded({extended: true}));

// Show routes called in console during development
if (Env.NodeEnv === NodeEnvs.Dev.valueOf()) {
  app.use(morgan('dev'));
}

// Security
if (Env.NodeEnv === NodeEnvs.Production.valueOf()) {
  app.use(helmet());
}

// Add APIs, must be after middleware
app.use(Paths.Base, BaseRouter);

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


// **** Front-End Content

// Set views directory (html)
const viewsDir = path.join(__dirname, 'views');
app.set('views', viewsDir);

// Set static directory (js and css).
const staticDir = path.join(__dirname, 'public');
app.use(express.static(staticDir));

// Nav to users pg by default
app.get('/', (_: Request, res: Response) => {
  return res.redirect('/users');
});

// Redirect to login if not logged in.
app.get('/users', (_: Request, res: Response) => {
  return res.sendFile('users.html', { root: viewsDir });
});

const typeDefs = `
  type Repository {
    name: String!
    size: Int!
    owner: String!
  }

  type RepositoryDetails {
    name: String!
    size: Int!
    owner: String!
    isPrivate: Boolean!
    filesCount: Int!
    ymlContent: String
    webHooks: [WebHook!]!
  }

  type WebHook {
    id: ID!
    name: String
    active: Boolean
    config: WebHookConfig
  }

  type WebHookConfig {
    url: String
    contentType: String
  }

  type Query {
    repos: [Repository!]!
    repoDetails(repoName: String!): RepositoryDetails
  }
`;

const resolvers = {
  Query: {
    repos: async () => {
      try {
        const response = await githubApiClient.get('/user/repos');
        return response.data.map(({ name, size, owner: { login } }) => ({
          name,
          size,
          owner: login,
        }));
      } catch (error) {
        console.error(error);
        throw new Error('Failed to fetch repositories');
      }
    },
    repoDetails: async (_: any, { repoName }: { repoName: string }) => {
      try {
        const response = await githubApiClient.get(`/repos/atsekin/${repoName}`);
        const {
          name,
          size,
          owner: { login },
          private: isPrivate,
        } = response.data;

        const contents = await githubApiClient.get(`/repos/atsekin/${repoName}/git/trees/master?recursive=1`);
        const files = contents.data.tree.filter(({ type }) => type === 'blob');
        const filesCount = files.length;

        const ymlFilePath = files.find(({ path }) => path.endsWith('.yml'))?.path;
        let ymlContent = null;

        if (ymlFilePath) {
          const ymlFile = await githubApiClient.get(`/repos/atsekin/${repoName}/contents/${ymlFilePath}`);
          ymlContent = Buffer.from(ymlFile.data.content, 'base64').toString('utf-8');
        }

        const webHooksResponse = await githubApiClient.get(`/repos/atsekin/${repoName}/hooks`);
        const webHooks = webHooksResponse.data
          .filter(({ active }) => active)
          .map(({ id, name, active, config }) => ({
            id,
            name,
            active,
            config: {
              url: config.url,
              contentType: config.content_type,
            },
          }
        ));

        return {
          name,
          size,
          owner: login,
          isPrivate,
          filesCount,
          ymlContent,
          webHooks,
        };
      } catch (error) {
        console.error(error);
        throw new Error('Failed to fetch repository details');
      }
    },
  },
};

const server = new ApolloServer({ typeDefs, resolvers });

(async () => {
  await server.start();

  app.use('/graphql', cors(), bodyParser.json(), expressMiddleware(server));

})();

/******************************************************************************
                                Export default
******************************************************************************/

export default app;
